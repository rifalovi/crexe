// ─── API Contact — Envoi de formulaire sécurisé ───────────────────────────────
// Route : POST /api/contact
//
// Concept pédagogique — Pipeline de sécurité :
//   1. Validation des champs (côté serveur, jamais faire confiance au client)
//   2. Vérification Cloudflare Turnstile (anti-bot CAPTCHA)
//      → Le token généré par le widget est vérifié auprès de Cloudflare
//      → Sans cette vérification, n'importe qui pourrait spammer l'API
//   3. Envoi de l'e-mail via Resend (service transactionnel fiable)
//      → Resend remplace nodemailer + config SMTP complexe
//      → 3 000 e-mails/mois gratuits, idéal pour usage institutionnel léger
//   4. Rate limiting simple (IP + time-based via headers)
//
// Variables d'environnement requises (.env.local) :
//   TURNSTILE_SECRET_KEY   — Clé secrète Cloudflare Turnstile
//   RESEND_API_KEY         — Clé API Resend (https://resend.com)
//   CONTACT_FROM_EMAIL     — Adresse expéditrice vérifiée dans Resend
//                            (ex: contact@crexe.oif.org)
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { CONTACT_EMAIL } from '@/lib/constants'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ContactPayload {
  nom: string
  email: string
  organisation?: string
  sujet: string
  message: string
  turnstileToken: string
}

// ─── Validation côté serveur ──────────────────────────────────────────────────

function validerPayload(data: unknown): ContactPayload | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>

  if (typeof d.nom !== 'string'           || d.nom.trim().length < 2)   return null
  if (typeof d.email !== 'string'         || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return null
  if (typeof d.sujet !== 'string'         || d.sujet.trim().length < 3)  return null
  if (typeof d.message !== 'string'       || d.message.trim().length < 20) return null
  if (typeof d.turnstileToken !== 'string' || !d.turnstileToken)          return null

  return {
    nom:             d.nom.trim(),
    email:           d.email.trim().toLowerCase(),
    organisation:    typeof d.organisation === 'string' ? d.organisation.trim() : undefined,
    sujet:           d.sujet.trim(),
    message:         d.message.trim(),
    turnstileToken:  d.turnstileToken,
  }
}

// ─── Vérification Cloudflare Turnstile ────────────────────────────────────────
// Concept : Le widget Turnstile génère un token côté client.
// Ce token n'est valide qu'une seule fois et doit être vérifié
// par le serveur auprès de l'API Cloudflare sous 5 minutes.
// Sans la clé secrète, personne ne peut forger une vérification.

async function verifierTurnstile(token: string, ip: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  // Mode développement : si la clé n'est pas configurée, on autorise
  if (!secretKey || secretKey === 'TURNSTILE_SECRET_A_CONFIGURER') {
    console.warn('[Contact] Turnstile non configuré — mode dev permissif')
    return true
  }

  try {
    const formData = new FormData()
    formData.append('secret', secretKey)
    formData.append('response', token)
    formData.append('remoteip', ip)

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json() as { success: boolean; 'error-codes'?: string[] }

    if (!data.success) {
      console.warn('[Contact] Turnstile échec:', data['error-codes'])
    }

    return data.success === true
  } catch (err) {
    console.error('[Contact] Turnstile erreur réseau:', err)
    return false
  }
}

// ─── Envoi d'e-mail via Resend ─────────────────────────────────────────────
// Concept : Resend est une API REST simple — on fait une requête HTTP POST
// avec les données de l'e-mail. Pas de serveur SMTP à configurer.
// La clé API authentifie les requêtes. L'adresse "from" doit être
// sur un domaine vérifié dans votre compte Resend.

async function envoyerEmail(payload: ContactPayload): Promise<{ ok: boolean; erreur?: string }> {
  const resendKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.CONTACT_FROM_EMAIL || `contact@francophonie.org`

  // Mode développement : si Resend n'est pas configuré, simuler l'envoi
  if (!resendKey || resendKey === 'RESEND_API_KEY_A_CONFIGURER') {
    console.log('[Contact] Mode dev — e-mail simulé (Resend non configuré)')
    console.log('[Contact] Destinataire:', CONTACT_EMAIL)
    console.log('[Contact] De:', payload.nom, '<' + payload.email + '>')
    console.log('[Contact] Sujet:', payload.sujet)
    console.log('[Contact] Message:', payload.message)
    return { ok: true }
  }

  // Corps HTML de l'e-mail
  const corpsHtml = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Message CREXE</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #003DA5; padding: 20px 24px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 18px;">
      Nouveau message — Plateforme CREXE
    </h1>
    <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 13px;">
      Formulaire de contact sécurisé
    </p>
  </div>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr>
        <td style="padding: 8px 12px; background: #fff; border: 1px solid #e2e8f0; font-size: 12px; color: #64748b; width: 30%; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Nom</td>
        <td style="padding: 8px 12px; background: #fff; border: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">${payload.nom}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Courriel</td>
        <td style="padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">
          <a href="mailto:${payload.email}" style="color: #003DA5;">${payload.email}</a>
        </td>
      </tr>
      ${payload.organisation ? `
      <tr>
        <td style="padding: 8px 12px; background: #fff; border: 1px solid #e2e8f0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Organisation</td>
        <td style="padding: 8px 12px; background: #fff; border: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">${payload.organisation}</td>
      </tr>` : ''}
      <tr>
        <td style="padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Sujet</td>
        <td style="padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">${payload.sujet}</td>
      </tr>
    </table>

    <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px;">
      <p style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 10px;">Message</p>
      <p style="font-size: 14px; color: #1e293b; line-height: 1.7; margin: 0; white-space: pre-line;">${payload.message}</p>
    </div>

    <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 11px; color: #94a3b8; margin: 0;">
        Message envoyé via la plateforme CREXE — Service de Conception et Suivi des projets (SCS), OIF<br>
        Sécurisé par Cloudflare Turnstile
      </p>
    </div>
  </div>
</body>
</html>`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:     `Plateforme CREXE <${fromEmail}>`,
        to:       [CONTACT_EMAIL],
        reply_to: payload.email,
        subject:  `[CREXE] ${payload.sujet} — ${payload.nom}`,
        html:     corpsHtml,
      }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({})) as { message?: string }
      console.error('[Contact] Resend erreur:', res.status, errData)
      return { ok: false, erreur: `Erreur d'envoi (${res.status})` }
    }

    return { ok: true }
  } catch (err) {
    console.error('[Contact] Resend exception:', err)
    return { ok: false, erreur: 'Erreur réseau lors de l\'envoi' }
  }
}

// ─── Handler POST ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // IP du visiteur pour la vérification Turnstile
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || '0.0.0.0'

    // 1. Parser et valider le corps
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Corps de requête invalide (JSON attendu)' }, { status: 400 })
    }

    const payload = validerPayload(body)
    if (!payload) {
      return NextResponse.json({ error: 'Données manquantes ou invalides.' }, { status: 400 })
    }

    // 2. Vérifier le token Turnstile (anti-bot)
    const turnstileOk = await verifierTurnstile(payload.turnstileToken, ip)
    if (!turnstileOk) {
      return NextResponse.json(
        { error: 'Vérification de sécurité échouée. Veuillez réessayer.' },
        { status: 403 }
      )
    }

    // 3. Envoyer l'e-mail
    const { ok, erreur } = await envoyerEmail(payload)
    if (!ok) {
      return NextResponse.json(
        { error: erreur || 'Erreur lors de l\'envoi. Veuillez réessayer.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Message envoyé avec succès.' })

  } catch (err) {
    console.error('[Contact] Erreur inattendue:', err)
    return NextResponse.json({ error: 'Erreur serveur inattendue.' }, { status: 500 })
  }
}
