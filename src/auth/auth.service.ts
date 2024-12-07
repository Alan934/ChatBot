import { HttpException, Injectable, Req, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ProfileService } from '../profile/profile.service';
import { OAuth2Client } from 'google-auth-library';
import { envs } from 'src/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(
        private readonly profileService: ProfileService,
        private readonly jwtService: JwtService,
    ) {}

    async signIn(email: string): Promise<any> {
        try {
            let profile = await this.profileService.findProfileByMail(email);
    
            if (!profile) {
                throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
            }
    
            const { password, ...result } = profile;
            const payload = { sub: profile.id, email: profile.email };
    
            return {
                data: {
                    ...result,
                },
                token: await this.jwtService.signAsync(payload),
            };
        } catch (error) {
            throw new HttpException('Failed SingIn', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }    

    async signInGoogle(@Req() req) {
        const email = req.user.email;
        const fullName = req.user.firstName + ' ' + req.user.lastName;
        const tokenGoogle = req.user.accessToken;

        if(!tokenGoogle) {
            throw new HttpException('Access Token Google Not Found', 404);
        }

        const profile = await this.profileService.findEmailGoogle(email, fullName);
        
        
        if (!profile) {
            throw new HttpException('Profile not found', 404);
        }

        const jwtPayload = { sub: profile.id, email: profile.email };

        if(!req.isAuthenticated) {
            throw new HttpException('Invalid Google account', 400);
        } else {
            const { password, ...result } = profile;
            return {
                data: {
                    result,
                },
                token: await this.jwtService.signAsync(jwtPayload),
            }
        }
    }


}
