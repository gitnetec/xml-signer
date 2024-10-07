import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { exec } from 'child_process';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import crypto from 'crypto';
import schedule from 'node-schedule';

const runCommand = (command: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            if (stderr) {
                reject(stderr);
            }
            resolve(stdout);
        });
    });
};

const generateUniqueFileName = (prefix: string): string => {
    return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
};

export const scheduleFileDeletion = (filePath: string) => {
    const delayMinutes = 15;
    const job = schedule.scheduleJob(new Date(Date.now() + delayMinutes * 60000), function () {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Erro ao excluir o arquivo ${filePath}:`, err);
            } else {
                console.log(`Arquivo excluído com sucesso: ${filePath}`);
            }
        });
    });

    console.log(`Agendada exclusão do arquivo: ${filePath} para daqui a ${delayMinutes} minutos`);
};

export async function signAndCompressXml(xml: string, pfxPath: string, passphrase: string): Promise<{ base64GzipXml: string; signedXmlPath: string }> {
    const outputDir = path.resolve(__dirname, '..', '..', 'output');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }


    const uniqueId = generateUniqueFileName('sign');
    const privateKeyPath = path.join(outputDir, `private_key_${uniqueId}.pem`);
    const certificatePath = path.join(outputDir, `certificate_${uniqueId}.pem`);
    const caCertPath = path.join(outputDir, `ca_cert_${uniqueId}.pem`);
    const signedXmlPath = path.join(outputDir, `signed_file_${uniqueId}.xml`);
    const xmlWithSignaturePlaceholders = path.join(outputDir, `xml_with_signature_${uniqueId}.xml`);

    const xmlWithPlaceholders = addSignaturePlaceholders(xml);
    fs.writeFileSync(xmlWithSignaturePlaceholders, xmlWithPlaceholders, { encoding: 'utf8' });

    const passphraseOption = passphrase ? `-passin pass:${passphrase}` : '';

    console.log(`Caminho da chave privada: ${privateKeyPath}`);
    console.log(`Caminho do certificado: ${certificatePath}`);
    console.log(`Caminho do XML assinado: ${signedXmlPath}`);
    console.log(`Caminho do arquivo XML com placeholders: ${xmlWithSignaturePlaceholders}`);
    console.log('Verificação de existência de arquivos:');
    console.log('Private Key Exists:', fs.existsSync(privateKeyPath));
    console.log('Certificate Exists:', fs.existsSync(certificatePath));
    console.log('XML with Placeholders Exists:', fs.existsSync(xmlWithSignaturePlaceholders));

    try {

        await runCommand(`openssl pkcs12 -in ${pfxPath} -nocerts -nodes -out ${privateKeyPath} ${passphraseOption}`);
        await runCommand(`openssl pkcs12 -in ${pfxPath} -clcerts -nokeys -out ${certificatePath} ${passphraseOption}`);
        await runCommand(`openssl pkcs12 -in ${pfxPath} -cacerts -nokeys -out ${caCertPath} ${passphraseOption}`);

        let signCommand = `xmlsec1 --sign --privkey-pem ${privateKeyPath},${certificatePath}`;

        if (fs.existsSync(caCertPath) && fs.readFileSync(caCertPath, 'utf8').trim() !== '') {
            signCommand += ` --trusted-pem ${caCertPath}`;
        }

        signCommand += ` --verbose --output ${signedXmlPath} ${xmlWithSignaturePlaceholders}`;

        await runCommand(signCommand);

        scheduleFileDeletion(signedXmlPath);

        const signedXml = fs.readFileSync(signedXmlPath, 'utf8');
        const gzipBuffer = zlib.gzipSync(signedXml);
        const base64GzipXml = gzipBuffer.toString('base64');

        fs.unlinkSync(privateKeyPath);
        fs.unlinkSync(certificatePath);
        fs.unlinkSync(caCertPath);
        fs.unlinkSync(xmlWithSignaturePlaceholders);

        return { base64GzipXml, signedXmlPath };
    } catch (error) {
        // [privateKeyPath, certificatePath, caCertPath, signedXmlPath, xmlWithSignaturePlaceholders].forEach(file => {
        //     if (fs.existsSync(file)) {
        //         fs.unlinkSync(file);
        //     }
        // });
        throw new Error(`Erro ao assinar e comprimir XML: ${(error as Error).message}`);
    }
}

function addSignaturePlaceholders(xml: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');

    const signatureElement = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:Signature');
    const signedInfo = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:SignedInfo');
    const canonicalizationMethod = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:CanonicalizationMethod');
    const signatureMethod = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:SignatureMethod');
    const reference = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:Reference');
    const transforms = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:Transforms');
    const transform1 = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:Transform');
    const transform2 = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:Transform');
    const digestMethod = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:DigestMethod');
    const digestValue = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:DigestValue');
    const signatureValue = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:SignatureValue');
    const keyInfo = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:KeyInfo');
    const x509Data = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:X509Data');
    const x509Certificate = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:X509Certificate');


    canonicalizationMethod.setAttribute('Algorithm', 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315');
    signatureMethod.setAttribute('Algorithm', 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256');
    reference.setAttribute('URI', '');
    transform1.setAttribute('Algorithm', 'http://www.w3.org/2000/09/xmldsig#enveloped-signature');
    transform2.setAttribute('Algorithm', 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315');
    digestMethod.setAttribute('Algorithm', 'http://www.w3.org/2001/04/xmlenc#sha256');

    digestValue.textContent = '';
    signatureValue.textContent = '';
    x509Certificate.textContent = '';

    transforms.appendChild(transform1);
    transforms.appendChild(transform2);
    reference.appendChild(transforms);
    reference.appendChild(digestMethod);
    reference.appendChild(digestValue);
    signedInfo.appendChild(canonicalizationMethod);
    signedInfo.appendChild(signatureMethod);
    signedInfo.appendChild(reference);
    keyInfo.appendChild(x509Data);
    x509Data.appendChild(x509Certificate);
    signatureElement.appendChild(signedInfo);
    signatureElement.appendChild(signatureValue);
    signatureElement.appendChild(keyInfo);

    const root = doc.documentElement;

    if (root) {
        root.insertBefore(signatureElement, root.firstChild);
    } else {
        throw new Error('Document element is null');
    }

    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
}
