// =====================================================================
// Script d'upload des médias vers Supabase Storage
// Exécuter depuis le dossier racine du projet :
//   node data/seeds/upload-medias.mjs
// =====================================================================

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname, basename } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Charger les variables d'environnement manuellement
import { readFileSync as rf } from 'fs'
let envVars = {}
try {
  const envContent = rf(join(__dirname, '../../.env.local'), 'utf8')
  envContent.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=')
    if (key && !key.startsWith('#')) envVars[key.trim()] = vals.join('=').trim()
  })
} catch {}

const SUPABASE_URL = envVars['NEXT_PUBLIC_SUPABASE_URL']
const SERVICE_KEY  = envVars['SUPABASE_SERVICE_ROLE_KEY']
const BUCKET       = 'medias-crexe'

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Variables manquantes dans .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const MEDIAS_DIR = join(__dirname, '../raw/medias')

// Déterminer le Content-Type selon l'extension
function mimeType(file) {
  const ext = extname(file).toLowerCase()
  return { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
           '.png': 'image/png', '.svg': 'image/svg+xml',
           '.webp': 'image/webp' }[ext] || 'application/octet-stream'
}

async function uploadDossier(dossier) {
  const projet = basename(dossier)
  const fichiers = readdirSync(dossier).filter(f => statSync(join(dossier, f)).isFile())
  
  for (const fichier of fichiers) {
    const cheminLocal  = join(dossier, fichier)
    const cheminRemote = `projets/${projet}/${fichier}`
    const data         = readFileSync(cheminLocal)
    const contentType  = mimeType(fichier)

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(cheminRemote, data, { contentType, upsert: true })

    if (error) {
      console.error(`  ❌ ${cheminRemote} — ${error.message}`)
    } else {
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(cheminRemote)
      console.log(`  ✅ ${cheminRemote}`)
      console.log(`     ${urlData.publicUrl}`)
    }
  }
}

async function main() {
  console.log(`\n📤 Upload vers Supabase Storage — bucket: ${BUCKET}\n`)

  const dossiers = readdirSync(MEDIAS_DIR)
    .map(d => join(MEDIAS_DIR, d))
    .filter(d => statSync(d).isDirectory())

  for (const dossier of dossiers) {
    const projet = basename(dossier)
    console.log(`\n📁 ${projet}`)
    await uploadDossier(dossier)
  }

  // Upload du logo OIF
  const logo = join(MEDIAS_DIR, 'logos/oif-logo.png')
  const logoData = readFileSync(logo)
  const { error } = await supabase.storage
    .from(BUCKET).upload('logos/oif-logo.png', logoData, { contentType: 'image/png', upsert: true })
  if (!error) console.log('\n✅ logos/oif-logo.png')

  console.log('\n🎉 Upload terminé !\n')
}

main().catch(console.error)
