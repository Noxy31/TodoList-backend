import { Router, Request, Response } from 'express';
import { query } from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';


dotenv.config();

const router = Router();
router.use(cookieParser());

router.post('/login', async (req: Request, res: Response) => {
  console.log('Login endpoint hit');
  const { email, password } = req.body;

  try {

    const sql = 'SELECT * FROM utilisateur WHERE userMail = ?';
    const users = await query(sql, [email]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const user = users[0];

    const match = await bcrypt.compare(password, user.hashedPass);
    
    if (!match) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET non défini');
      return res.status(500).json({ message: 'Erreur de configuration du serveur' });
    }

    
    const token = jwt.sign({ id: user.id, email: user.userMail, isAdmin: user.isAdmin }, jwtSecret, {
      expiresIn: '1h',
    });

  
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict', 
      maxAge: 60 * 60 * 1000, // 1 heure
    });


    res.status(200).json({ message: 'Connexion réussie' });
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

export default router;