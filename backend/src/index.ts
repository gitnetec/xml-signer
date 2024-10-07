import express from 'express';
import cors from 'cors';
import path from 'path';
import signRoutes from './routes/signRoutes';

const app = express();

// Configuração do CORS
app.use(cors({
  origin: 'https://xml.leonardogallo.co',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/output', express.static(path.join(__dirname, '..', 'output')));

app.use('/sign', signRoutes);

app.listen(3771, () => {
  console.log('Servidor rodando na porta 3771');
});
