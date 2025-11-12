import { Request, Response } from 'express';
import { Controller } from './Controller';
import { LoginOrRegisterUseCase } from '@/contexts/users/application/LoginOrRegisterUseCase';

export class LoginXController implements Controller {
  constructor(private readonly loginOrRegisterUseCase: LoginOrRegisterUseCase) {}

  async run(req: Request, res: Response): Promise<void> {
    const { authorization_code, code_verifier } = req.body;

    if (!authorization_code || !code_verifier) {
      res.status(400).json({ error: 'Missing authorization_code or code_verifier' });
      return;
    }

    try {
      const response = await this.loginOrRegisterUseCase.run(authorization_code, code_verifier);
      res.status(200).json({ user: response.user.toPrimitives(), token: response.token });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
