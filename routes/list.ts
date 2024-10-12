import { Router, Request, Response } from 'express';
import { query } from '../db';
import { Users } from '../models/Users';
import authMiddleware from '../middlewares/authenticate';
import enAccMiddleware from '../middlewares/isAccEnabled';

const listRouter = Router();

listRouter.post('/create', authMiddleware, enAccMiddleware, async (req: Request, res: Response) => {
  const { labelList, isPersonnal, idCategory } = req.body;
  const userId = (req as any).user.id;

  const listCreationTime = new Date();
  const isArchived = false;
  const listUpdateTime = null;
  const archiveTime = null;
  const idArchiver = null;

  try {
    const sql = `
      INSERT INTO list (labelList, listCreationTime, listUpdateTime, archiveTime, isArchived, isPersonnal, idArchiver, idUser, idCategory) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      labelList,
      listCreationTime,
      listUpdateTime,
      archiveTime,
      isArchived,
      isPersonnal,
      idArchiver,
      userId,
      isPersonnal ? null : idCategory,
    ]);

    res.status(201).json({ message: 'list successfully created', listId: result.insertId });
  } catch (error) {
    res.status(500).send(error);
  }
});


listRouter.get('/:userId', authMiddleware, enAccMiddleware, async (req: Request, res: Response) => {
  const userId = req.params.userId;

  try {
    const sql = `SELECT * FROM list WHERE idUser = ?`;
    const lists = await query(sql, [userId]);

    if (lists.length === 0) {
      return res.status(404).json({ message: 'no list found for this user' });
    }

    res.status(200).json(lists);
  } catch (error) {
    res.status(500).send(error);
  }
});

listRouter.get('/tasklist/:idList', authMiddleware, enAccMiddleware, async (req: Request, res: Response) => {
  console.log('Received request for list ID:', req.params.idList);

  const listId = req.params.idList;
  
  try {
    const sql = `
      SELECT l.labelList, l.isPersonnal, l.listCreationTime, u.userName, u.userSurname
      FROM list l 
      JOIN users u ON l.idUser = u.idUser 
      WHERE l.idList = ?`;
    
    const results = await query(sql, [listId]);

    if (results.length === 0) {
      return res.status(404).send('list not found');
    }

    const list = results[0];
    
    res.status(200).json({
      labelList: list.labelList,
      isPersonnal: list.isPersonnal,
      listCreationTime: list.listCreationTime,
      creatorName: list.userName + ' ' + list.userSurname,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

export default listRouter;