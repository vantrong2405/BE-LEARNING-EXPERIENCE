import { Body, Controller, Delete, Get, Param, Patch, Post, Query, ParseIntPipe, DefaultValuePipe, BadRequestException, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';
import { VerifiedGuard } from 'src/shared/guards/verified.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles, UserRole } from 'src/shared/decorators/roles.decorator';

@Controller('category')
export class CategoryController {
    constructor(
        private readonly categoryService: CategoryService
    ) { }

    @Get()
    async getCategories(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    ) {
        if (page < 1) {
            throw new BadRequestException('Page number must be greater than 0');
        }
        if (limit < 1 || limit > 100) {
            throw new BadRequestException('Limit must be between 1 and 100');
        }
        return await this.categoryService.getCategories({ page, limit });
    }

    @Get('/:id')
    async getCategoryById(@Param('id') id: string) {
        return await this.categoryService.getCategoryById(id);
    }

    @UseGuards(AccessTokenGuard, VerifiedGuard, RolesGuard)
    @Roles(UserRole.Admin, UserRole.Instructor)
    @Post()
    async createCategory(@Body() body: { name: string; description?: string }) {
        return await this.categoryService.createCategory(body);
    }

    @UseGuards(AccessTokenGuard, VerifiedGuard, RolesGuard)
    @Roles(UserRole.Admin, UserRole.Instructor)
    @Patch('/:id')
    async updateCategory(
        @Param('id') id: string,
        @Body() body: { name?: string; description?: string }
    ) {
        return await this.categoryService.updateCategory(id, body);
    }

    @UseGuards(AccessTokenGuard, VerifiedGuard, RolesGuard)
    @Roles(UserRole.Admin, UserRole.Instructor)
    @Delete('/:id')
    async deleteCategory(@Param('id') id: string) {
        return await this.categoryService.deleteCategory(id);
    }
}