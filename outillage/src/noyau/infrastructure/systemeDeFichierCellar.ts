import type { SystemeDeFichier } from '../ports/SystemeDeFichier.ts';
import { environnement } from '../environnement.ts';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export class SystemeDeFichierCellar implements SystemeDeFichier {
  creeDossier(_chemin: string): void {
    throw new Error('Non implementé');
  }

  creeDossierPrive(_chemin: string): void {
    throw new Error('Non implementé');
  }

  async ecritFichier(chemin: string, contenu: string): Promise<void> {
    const cellar = environnement.pourProxyLiteLLM().cellar();
    const s3Client = new S3Client({
      endpoint: cellar.url,
      region: cellar.region,
      credentials: cellar.credentials,
    });
    await s3Client.send(
      new PutObjectCommand({
        ACL: 'authenticated-read',
        ContentType: 'text/plain',
        Bucket: cellar.nomDuBucket,
        Body: Buffer.from(contenu, 'utf-8'),
        Key: chemin.substring(chemin.lastIndexOf('/') + 1),
      })
    );
  }

  ecritFichierPrive(_chemin: string, _contenu: string): void {
    throw new Error('Non implementé');
  }

  existe(_chemin: string): boolean {
    throw new Error('Non implementé');
  }

  lit(_chemin: string): string {
    throw new Error('Non implémenté');
  }
}
