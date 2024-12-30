const APIfeatures = require('../utils/API-features');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');



//GET ALL
exports.getAll = Model => catchAsync(async (req, res, next) => {

    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId }

    //EXECUTE QUERY
    const features = new APIfeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .pagination()
    //const doc = await features.query.explain();
    const doc = await features.query;
    
    //SEND RESPONSE
    res.status(200).json({
        status: 'success',
        createdAt: req.requestTime,
        results: doc.length,
        data: {
            doc
        }
    });
    next();
});




//GET SINGLE
exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {

    let query = Model.findById(req.params.id).populate('reviews');
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            doc
        }
    });
    next();
});


//CREATE
exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
        status: 'success',
        createdAt: req.createdOn,
        data: {
            data: doc
        }
    });
    next();
});



//DELETE
exports.deleteOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
        return next(new AppError('No document found with that ID', 404))
    }
    res.status(204).json({
        status: "Success",
        data: null
    });
    next();
});


//UPDATE
exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!doc) {
        return next(new AppError('No document found with that ID', 404))
    }
    res.status(200).json({
        status: "Success",
        data: {
            doc
        }
    });
    next();
});