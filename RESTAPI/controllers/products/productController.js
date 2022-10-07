import { Product } from "../../models";
import multer from 'multer';
import path from 'path';
import CustomErrorHandler from "../../services/customErrorHandler";
import productSchema from "../../validator/productValidator";
import fs from 'fs';

const storage = multer.diskStorage({
    destination: (req, file, callback) => { callback(null, 'uploads/') },
    filename: (req, file, callback) => {
        let uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        callback(null, uniqueName)
    }
});

const handleMultiPartData = multer({
    storage,
    limits: {
        fileSize: 100000 * 5 // 5mb
    }
}).single('image')

const productController = {
    async store(req, res, next) {
        // Multi-part form Data Received
        handleMultiPartData(req, res, async (err) => {
            if (err) {
                return next(CustomErrorHandler.serverError(err.message));
            }
            console.log(req.file);
            const filePath = req.file.path;

            // validation
            const { error } = productSchema.validate(req.body);
            if (error) {
                // Delete the upload file
                fs.unlink(`${appRoot}/${filePath}`, (err) => {
                    if (err) {
                        return next(CustomErrorHandler.serverError(err.message));
                    }
                })
                return next(error);
            }

            const { name, price, size } = req.body;
            let product;
            try {
                product = await Product.create({
                    name,
                    price,
                    size,
                    image: filePath
                })
            } catch (err) {
                return next(err);
            }

            res.status(201).json({ product });

        })
    },

    async update(req, res, next) {
        // Multi-part form Data Received
        handleMultiPartData(req, res, async (err) => {
            if (err) {
                return next(CustomErrorHandler.serverError(err.message));
            }
            console.log(req.file);
            const filePath = req.file.path;

            // validation
            const { error } = productSchema.validate(req.body);
            if (error) {
                // Delete the upload file
                if (req.file) {
                    fs.unlink(`${appRoot}/${filePath}`, (err) => {
                        if (err) {
                            return next(CustomErrorHandler.serverError(err.message));
                        }
                    })
                }
                return next(error);
            }

            const { name, price, size } = req.body;
            let product;
            try {
                product = await Product.findOneAndUpdate({ _id: req.params.id }, {
                    name,
                    price,
                    size,
                    ...(req.file && { image: filePath })
                }, { new: true })
            } catch (err) {
                return next(err);
            }

            res.status(201).json({ product });

        })
    },

    async delete(req, res, next) {
        const product = Product.findOneAndRemove({ _id: req.params.id });
        if (!product) {
            return next(new Error('Nothing to delete !!'));
        }

        // Delete image from folder
        const imagePath = product_doc.image;
        fs.unlink(`${appRoot}/${imagePath}`, (err) => {
            if (err) {
                return next(CustomErrorHandler.serverError(err));
            }

        });

        res.json({ product });

    },

    async fetchProduct(req, res, next) {
        let products;
        try {
            products = await Product.find();

        }
        catch (err) {
            return next(CustomErrorHandler.serverError());
        }

        return res.json({ products });
    },

    async fetchSingleProduct(req, res, next) {
        let product;
        try {
            product = await Product.findOne({ _id: req.params.id });

        }
        catch (err) {
            return next(CustomErrorHandler.serverError());
        }

        return res.json({ product });
    }

};

export default productController;