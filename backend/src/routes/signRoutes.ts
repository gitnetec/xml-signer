import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { signAndCompressXml, scheduleFileDeletion } from '../services/signService';
import path from 'path';

const router = express.Router();
const upload = multer({ dest: 'dist/uploads/' });

interface SignRequest extends Request {
    file?: Express.Multer.File;
    body: {
        passphrase?: string;
        xml?: string;
    };
}

router.post('/', upload.single('pfx'), async (req: SignRequest, res: Response): Promise<void> => {
    console.log('Requisição recebida em /sign');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('File:', req.file);

    try {
        const { passphrase, xml } = req.body;

        if (!passphrase) {
            console.error('Passphrase não fornecida');
            res.status(400).json({ error: 'Passphrase não fornecida' });
            return;
        }

        if (!xml) {
            console.error('XML não fornecido');
            res.status(400).json({ error: 'XML não fornecido' });
            return;
        }

        if (!req.file) {
            console.error('Arquivo PFX não fornecido');
            res.status(400).json({ error: 'Arquivo PFX não fornecido' });
            return;
        }

        const pfxFilePath = req.file.path;   
        scheduleFileDeletion(pfxFilePath);

        console.log('Iniciando processo de assinatura e compressão');
        console.log('PFX File Path:', pfxFilePath);

        const result = await signAndCompressXml(xml, pfxFilePath, passphrase);
        console.log('Processo concluído com sucesso');        

        const relativeSignedXmlPath = path.relative(process.cwd(), result.signedXmlPath);
        
        res.status(200).json({
            base64GzipXml: result.base64GzipXml,
            signedXmlPath: relativeSignedXmlPath
        });
    } catch (error) {
        console.error('Erro ao processar a requisição:', error);
        res.status(500).json({ error: `Erro ao processar: ${(error as Error).message}` });
    }
});

router.get('/download', (req: Request, res: Response, next: NextFunction): void => {
    const filePath = req.query.path as string;

    if (!filePath) {
        res.status(400).send('Path parameter is required');
        return;
    }
 
    const absolutePath = path.resolve(filePath); 

    res.download(absolutePath, (err) => {
        if (err) {
            console.error('Erro ao fazer download do arquivo:', err);
            next(err);
        }
    });
});


export default router;