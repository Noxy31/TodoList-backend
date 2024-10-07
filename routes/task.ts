import { Router, Request, Response } from "express";

const router = Router();

interface Todo {
  id: number;
  label: string;
  done: boolean;
  dueDate?: Date;
}

const monTableau: Todo[] = [
  { id: 1, label: "apprendre Vue Js", done: false, dueDate: new Date("2024-12-31") },
  { id: 2, label: "apprendre à faire des boucles", done: false },
  { id: 3, label: "apprendre à griller des saucisses", done: true, dueDate: new Date("2024-12-31") },
];

// Toutes les routes liées aux tâches "todo"
router.get("/todos", (req: Request, res: Response) => res.send(monTableau));

router.get("/todos/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const todo = monTableau.find((t) => t.id === id);
  if (todo) {
    res.send(todo);
  } else {
    res.status(404).send("Todo not found");
  }
});

router.put("/todos/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { label, done, dueDate } = req.body;
  const todoIndex = monTableau.findIndex((t) => t.id === id);
  if (todoIndex !== -1) {
    monTableau[todoIndex] = {
      ...monTableau[todoIndex],
      label: label || monTableau[todoIndex].label,
      done: done !== undefined ? done : monTableau[todoIndex].done,
      dueDate: dueDate ? new Date(dueDate) : monTableau[todoIndex].dueDate,
    };
    res.send(monTableau[todoIndex]);
  } else {
    res.status(404).send("Todo not found");
  }
});

router.delete("/todos/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const todoIndex = monTableau.findIndex((t) => t.id === id);
  if (todoIndex !== -1) {
    const deletedTodo = monTableau.splice(todoIndex, 1);
    res.send(deletedTodo);
  } else {
    res.status(404).send("Todo not found");
  }
});

router.post("/todos", (req: Request, res: Response) => {
  const { label, done, dueDate } = req.body;
  const newId = monTableau.length > 0 ? monTableau[monTableau.length - 1].id + 1 : 1;
  const newTodo: Todo = { id: newId, label, done, dueDate: dueDate ? new Date(dueDate) : undefined };
  monTableau.push(newTodo);
  res.status(201).send(newTodo);
});

export default router;