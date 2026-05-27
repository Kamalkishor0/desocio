import "dotenv/config";
import app from "./src/app";
import prisma from "./src/config/db";
const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});