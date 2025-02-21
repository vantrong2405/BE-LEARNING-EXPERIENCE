import { Controller } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { TokenService } from 'src/shared/services/token.service';

@Controller('course')
export class CoursesController {
    constructor(private readonly authService: AuthService, private readonly tokenService: TokenService) { }

}
