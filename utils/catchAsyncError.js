// A Reusable Function to working with async function and  avoid using tryCatch block

const catchAsyncError = (theFunc) => (req, res, next) => {
  Promise.resolve(theFunc(req, res, next)).catch(next);
};
module.exports = catchAsyncError;
