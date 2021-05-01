const mongoose = require('mongoose');

// connect to mongodb database using mongoose
mongoose.connect(process.env.MONGOOSE_URL, {
    useNewUrlParser:true,
    useUnifiedTopology: true, 
    useFindAndModify: false,
    useCreateIndex:true,
})

