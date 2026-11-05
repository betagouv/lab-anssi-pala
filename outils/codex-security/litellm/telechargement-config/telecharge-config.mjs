import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

export function litDepuisEnvironnement() {
  const hote = process.env.CELLAR_ADDON_HOST || '';
  const accessKeyId = process.env.CELLAR_ADDON_KEY_ID || '';
  const secretAccessKey = process.env.CELLAR_ADDON_KEY_SECRET || '';

  const manquantes = [];
  if (!hote) manquantes.push('CELLAR_ADDON_HOST');
  if (!accessKeyId) manquantes.push('CELLAR_ADDON_KEY_ID');
  if (!secretAccessKey) manquantes.push('CELLAR_ADDON_KEY_SECRET');
  if (manquantes.length > 0) {
    throw new Error(
      `Variables d'environnement Cellar manquantes : ${manquantes.join(', ')}.`
    );
  }

  return {
    endpoint: hote.startsWith('http') ? hote : `https://${hote}`,
    region: 'eu-west-3',
    credentials: { accessKeyId, secretAccessKey },
    bucket: 'litellm',
    cle: 'config.yaml',
    destination: '/app/proxy-config/config.yaml',
  };
}

export async function telechargeConfiguration(parametres) {
  const { endpoint, region, credentials, bucket, cle, destination } = parametres;

  const client = new S3Client({ endpoint, region, credentials });

  console.log(
    `Récupération de s3://${bucket}/${cle} depuis Cellar (${endpoint})…`
  );

  const reponse = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: cle })
  );

  if (!reponse.Body) {
    throw new Error(`Objet S3 vide : s3://${bucket}/${cle}.`);
  }

  const octets = await reponse.Body.transformToByteArray();

  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, Buffer.from(octets));

  console.log(`Configuration écrite dans ${destination} (${octets.length} octets).`);
  return destination;
}

export async function principal() {
  const parametres = litDepuisEnvironnement();
  await telechargeConfiguration(parametres);
}

const estLanceDirectement =
  process.argv[1] && import.meta.url === `file://${process.argv[1]}`;

if (estLanceDirectement) {
  principal().catch((erreur) => {
    console.error(
      `Échec du téléchargement de la configuration : ${erreur.message}`
    );
    process.exitCode = 1;
  });
}
