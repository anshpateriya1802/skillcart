import { z } from 'zod';
import { Category } from '../model/category.model.js';
import ApiResponse from '../utils/ApiResponse.js';

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
});

/**
 * Generate URL-friendly slug from name
 */
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

/**
 * Get all categories
 */
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    return ApiResponse.success(
      'Categories fetched successfully',
      categories
    ).send(res);
  } catch (error) {
    console.error('Get categories error:', error);
    return ApiResponse.serverError('Failed to fetch categories').send(res);
  }
};

/**
 * Get category by ID or slug
 */
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };

    const category = await Category.findOne(query);

    if (!category) {
      return ApiResponse.notFound('Category not found').send(res);
    }

    return ApiResponse.success('Category fetched successfully', category).send(
      res
    );
  } catch (error) {
    console.error('Get category error:', error);
    return ApiResponse.serverError('Failed to fetch category').send(res);
  }
};

/**
 * Create new category (Admin only)
 */
export const createCategory = async (req, res) => {
  try {
    const validatedData = createCategorySchema.parse(req.body);

    const slug = validatedData.slug || generateSlug(validatedData.name);

    const existingCategory = await Category.findOne({
      $or: [{ name: validatedData.name }, { slug }],
    });

    if (existingCategory) {
      if (existingCategory.name === validatedData.name) {
        return ApiResponse.conflict('Category with this name already exists').send(res);
      }
      if (existingCategory.slug === slug) {
        return ApiResponse.conflict('Category with this slug already exists').send(res);
      }
    }

    const category = await Category.create({
      name: validatedData.name,
      slug,
    });

    return ApiResponse.created(
      'Category created successfully',
      category
    ).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(
        res
      );
    }
    console.error('Create category error:', error);
    return ApiResponse.serverError('Failed to create category').send(res);
  }
};

/**
 * Update category (Admin only)
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateCategorySchema.parse(req.body);

    const category = await Category.findById(id);

    if (!category) {
      return ApiResponse.notFound('Category not found').send(res);
    }

    // Check for duplicates
    if (validatedData.name || validatedData.slug) {
      const newSlug = validatedData.slug || (validatedData.name ? generateSlug(validatedData.name) : null);
      
      const duplicateQuery = {
        _id: { $ne: id },
        $or: [],
      };

      if (validatedData.name) {
        duplicateQuery.$or.push({ name: validatedData.name });
      }
      if (newSlug) {
        duplicateQuery.$or.push({ slug: newSlug });
        validatedData.slug = newSlug;
      }

      if (duplicateQuery.$or.length > 0) {
        const existingCategory = await Category.findOne(duplicateQuery);
        if (existingCategory) {
          return ApiResponse.conflict('Category with this name or slug already exists').send(res);
        }
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    return ApiResponse.success(
      'Category updated successfully',
      updatedCategory
    ).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(
        res
      );
    }
    console.error('Update category error:', error);
    return ApiResponse.serverError('Failed to update category').send(res);
  }
};

/**
 * Delete category (Admin only)
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return ApiResponse.notFound('Category not found').send(res);
    }

    await Category.findByIdAndDelete(id);

    return ApiResponse.success('Category deleted successfully').send(res);
  } catch (error) {
    console.error('Delete category error:', error);
    return ApiResponse.serverError('Failed to delete category').send(res);
  }
};
