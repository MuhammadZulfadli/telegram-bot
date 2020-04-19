const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
dotenv.config({path: '.env'})


const indexRouter = require('./routes/index')
const CustomerRouter = require('./routes/Customers')
const ProductsRouter = require('./routes/Products')
const DriversRouter = require('./routes/Drivers')
const OrderRouter = require('./routes/Orders')
const OrderItemRouter = require('./routes/Order_items')
const port = process.env.SERVER_PORT || 5000;
const app  = express()


app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

app.use('/', indexRouter)
app.use('/api/v1/customer', CustomerRouter)
app.use('/api/v1/product', ProductsRouter)
app.use('/api/v1/driver', DriversRouter)
app.use('/api/v1/order', OrderRouter)
app.use('/api/v1/orderdetail', OrderItemRouter)

// const PORT = process.env.PORT || 5000
// app.listen(PORT, console.log(`Server running on port : ${PORT}`))

app.listen(port, "0.0.0.0", () =>
console.log(`server is running on http://localhost:${port}`)
)