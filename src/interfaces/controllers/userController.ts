import { ERROR_MESSAGES } from '@/utils/errorMessages';
import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@/utils/httpCodes';
import { UserRepository } from '@/infrastructure/repositories/UserRepository';
import CreateUser from '@/usecases/createUser';
import GetAllUsers from '@/usecases/getAllUsers';
import GetUserById from '@/usecases/getUserById';
import UpdateUser from '@/usecases/updateUser';
import DeleteUser from '@/usecases/deleteUser';
import logger from '@/infrastructure/log/logger';

export class UserController {
    private createUserUseCase: CreateUser;
    private getAllUsersUseCase: GetAllUsers;
    private getUserByIdUseCase: GetUserById;
    private updateUserUseCase: UpdateUser;
    private deleteUserUseCase: DeleteUser;

    constructor() {
        const userRepository = new UserRepository();
        this.createUserUseCase = new CreateUser(userRepository);
        this.getAllUsersUseCase = new GetAllUsers(userRepository);
        this.getUserByIdUseCase = new GetUserById(userRepository);
        this.updateUserUseCase = new UpdateUser(userRepository);
        this.deleteUserUseCase = new DeleteUser(userRepository);
    }

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email, password } = req.body || {};
            if (!password) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Password is required' });
            }
            const user = await this.createUserUseCase.execute(name, email, password);
            const rawUser = user as unknown as { toJSON?: () => Record<string, unknown> };
            const userJson = typeof rawUser.toJSON === 'function' ? rawUser.toJSON() : (user as unknown as Record<string, unknown>);
            res.status(HTTP_STATUS.CREATED).json(userJson);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`${ERROR_MESSAGES.CREATE_USER_ERROR}:`, message);
            next(error);
        }
    }

    async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const user = await this.getUserByIdUseCase.execute(id);
            if (!user) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
            }
            res.json(user);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`${ERROR_MESSAGES.FETCH_USER_ERROR}:`, message);
            next(error);
        }
    }

    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.getAllUsersUseCase.execute();
            res.json(users);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`${ERROR_MESSAGES.FETCH_USERS_ERROR}:`, message);
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name, email } = req.body || {};
            const user = await this.updateUserUseCase.execute(id, { name, email });
            if (!user) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
            }
            res.json(user);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`${ERROR_MESSAGES.UPDATE_USER_ERROR}:`, message);
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const deleted = await this.deleteUserUseCase.execute(id);
            if (!deleted) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
            }
            res.status(HTTP_STATUS.OK).json({ message: 'User deleted successfully' });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`${ERROR_MESSAGES.DELETE_USER_ERROR}:`, message);
            next(error);
        }
    }
}
