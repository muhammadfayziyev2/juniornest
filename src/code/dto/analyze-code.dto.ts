import { IsString } from 'class-validator';

export class AnalyzeCodeDto {
    @IsString()
    code: string;
}
