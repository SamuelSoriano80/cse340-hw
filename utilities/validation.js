// Classification validation rules
const classificationValidation = {
    classification_name: {
        notEmpty: true,
        isAlphaNumeric: {
            errorMessage: 'Classification name must contain only letters and numbers, no spaces or special characters'
        },
        isLength: {
            options: { min: 1, max: 30 },
            errorMessage: 'Classification name must be between 1 and 30 characters'
        }
    }
}

// Alphanumeric check
const isAlphaNumeric = (value) => {
    if (!value) return true
    return /^[a-zA-Z0-9]+$/.test(value)
}