import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, Request, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signUp.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.authService.signInGoogle(req);
  }

  @Post('signIn')
  @ApiBody({
    type: SignInDto,
    examples: {
      example: {
        value: {
          email: 'test@gmail.com',
          pass: 'password',
        },
      },
    },
  })
  @ApiTags('Profile')
  async signIn(@Body() signInDto: SignInDto) {
    try {
      return await this.authService.signIn(signInDto.email);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }    
  }

  @ApiTags('Authenticated')
  @Post('authenticated')
  @ApiBearerAuth('bearerAuth')
  async getProfile(@Req() req, @Res() res) {
    try {
      const [type, token] = req.headers.authorization?.split(' ') ?? [];
      const tok = type === 'Bearer' ? token : undefined;

      await this.jwtService.verifyAsync(token);
      return res.status(200).json({ isValid: true });

    } catch (error) {
      return res.status(200).json({ isValid: false, message: error.message });
    }
  }

  @ApiTags('Authenticated')
  @Post('refreshToken')
  @ApiBearerAuth('bearerAuth')
  async refreshToken(@Req() req, @Res() res) {
    try {
      const [type, token] = req.headers.authorization?.split(' ') ?? [];
      const tok = type === 'Bearer' ? token : undefined;

      const data = await this.jwtService.verifyAsync(token);

      const refresh = await this.jwtService.signAsync({sub: data.sub, email: data.email});

      return res.status(200).json({ token: refresh });

    } catch (error) {
      return res.status(200).json({ isValid: false, message: error.message });
    }
  }
}
