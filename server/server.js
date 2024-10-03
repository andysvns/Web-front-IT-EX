const express = require("express");

const bcrypt = require("bcrypt");
const cors = require("cors");
require("dotenv").config();

const jwt = require("jsonwebtoken");
const { pool } = require("./db");
// const multer = require("multer");
// const path = require("path");

const authenRouter = require("./routes/authen");
const productRoutes = require("./routes/ourproduct");
const partnerRoutes = require("./routes/ourpartner");
const listtaskRoutes = require("./routes/listtask");
const impactRoutes = require("./routes/impact");
const introRoutes = require("./routes/intro");
const memberRoutes = require("./routes/member");
const backgroundRoutes = require("./routes/background");
const homeaboutusRoutes = require("./routes/homeaboutus");

// const storage = multer.diskStorage({
//   destination: "./uploads",
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// // Initialize multer with the defined storage
// const upload = multer({
//   storage: storage,
//   fileFilter: function (req, file, cb) {
//     checkFileType(file, cb);
//   },
//   limits: { fileSize: 5000000 }, // 5MB limit
// });

// function checkFileType(file, cb) {
//   // Allowed extensions
//   const filetypes = /jpeg|jpg|png|gif/;
//   // Check extension
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   // Check mime
//   const mimetype = filetypes.test(file.mimetype);

//   if (mimetype && extname) {
//     return cb(null, true);
//   } else {
//     cb("Error: Images Only!");
//   }
// }

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/authen", authenRouter);
app.use("/api/products", productRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/listtask", listtaskRoutes);
app.use("/api/impact", impactRoutes);
app.use("/api/intro", introRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/background", backgroundRoutes);
app.use("/api/homeabout", homeaboutusRoutes);

// Database connection

// Test database connection
pool
  .getConnection()
  .then((connection) => {
    console.log("Database connected successfully");
    connection.release();
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error.message);
  });

// Register endpoint
app.post("/register", async (req, res) => {
  // Use app.post instead of router.post
  const { username, password, confirmpassword, fname, lname } = req.body;
  console.log("Register attempt for username:", username);

  if (password !== confirmpassword) {
    return res
      .status(400)
      .json({ success: false, message: "Passwords do not match" });
  }

  try {
    const [existingUser] = await pool.execute(
      "SELECT * FROM admin WHERE username = ?",
      [username]
    );

    if (existingUser.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      "INSERT INTO admin (username, password, fname ,lname) VALUES (?, ?, ?, ? )",
      [username, hashedPassword, fname, lname]
    );

    const token = jwt.sign(
      { userId: result.insertId, username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("Registration successful for user:", username);

    res.json({ success: true, message: "Registration successful", token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//Background
app.get("/background", async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT * FROM background WHERE stt = 1"
    );
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching data from the database:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve records", details: error.message });
  }
});

//List Task
//Create List Task
// app.post("/listtask/create", async (req, res) => {
//   const { icon, title, desc } = req.body;
//   console.log("Task creation attempt for title:", title);

//   if (!title) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Title is required" });
//   }

//   try {
//     const created_at = new Date();
//     const updated_at = new Date();
//     const stt = 1;

//     const [result] = await pool.execute(
//       "INSERT INTO list_task (icon, title, `desc`, created_at, updated_at, stt) VALUES (?, ?, ?, ?, ?, ?)",
//       [icon, title, desc, created_at, updated_at, stt]
//     );

//     console.log("Item creation successful for title:", title);

//     res.json({
//       success: true,
//       message: "Item created successfully",
//       taskId: result.insertId,
//     });
//   } catch (error) {
//     console.error("Item creation error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// //Get All List Task
// app.get("/listtask", async (req, res) => {
//   try {
//     const [results] = await pool.query("SELECT * FROM list_task WHERE stt = 1");
//     res.status(200).json(results);
//   } catch (error) {
//     console.error("Error fetching data from the database:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to retrieve records", details: error.message });
//   }
// });

// //Get one List Task
// app.get("/listtask/view/:id", async (req, res) => {
//   const { id } = req.params; // Extract the 'id' from the request parameters

//   try {
//     // Use parameterized query to prevent SQL injection
//     const [result] = await pool.query(
//       "SELECT * FROM list_task WHERE list_task_id = ?",
//       [id]
//     );

//     if (result.length > 0) {
//       res.status(200).json(result[0]); // Send the first matching contact as a response
//     } else {
//       res.status(404).json({ message: "Contact not found" }); // If no contact is found, return 404
//     }
//   } catch (error) {
//     console.error("Error fetching contact by ID:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to retrieve record", details: error.message });
//   }
// });

// //Update List Task
// app.put("/listtask/update/:id", async (req, res) => {
//   const { id } = req.params; // Extract the 'id' from the request parameters
//   const { icon, title, desc } = req.body; // Extract the contact details from the request body

//   try {
//     // Use parameterized query to update the contact record, preventing SQL injection
//     const [result] = await pool.query(
//       "UPDATE list_task SET icon = ?, title = ?, `desc` = ?, updated_at = CURRENT_TIMESTAMP WHERE list_task_id = ?",
//       [icon, title, desc, id]
//     );

//     if (result.affectedRows > 0) {
//       res.status(200).json({ message: "Item updated successfully" }); // Respond with success if a record was updated
//     } else {
//       res.status(404).json({ message: "Item not found" }); // If no record was updated, return 404
//     }
//   } catch (error) {
//     console.error("Error updating Item by ID:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to update record", details: error.message });
//   }
// });

// //Delete one List Task
// app.put("/listtask/del/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const [result] = await pool.query(
//       "UPDATE list_task SET stt = 0, updated_at = CURRENT_TIMESTAMP WHERE list_task_id = ?",
//       [id]
//     );

//     if (result.affectedRows > 0) {
//       res.status(200).json({ message: "stt field updated successfully" });
//     } else {
//       res.status(404).json({ message: "Record not found" });
//     }
//   } catch (error) {
//     console.error("Error updating stt field by ID:", error);
//     res.status(500).json({
//       error: "Failed to update stt field",
//       details: error.message,
//       stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
//     });
//   }
// });

//Create Our Product
// app.post("/ourproduct/create", upload.single("img"), async (req, res) => {
//   try {
//     const { title, desc } = req.body;
//     console.log("Item creation attempt for title:", title);

//     if (!title) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Title is required" });
//     }

//     let imgPath = null;
//     if (req.file) {
//       console.log("Uploaded file:", req.file);
//       imgPath = req.file.path;
//     } else {
//       console.log("No file uploaded");
//     }

//     const created_at = new Date();
//     const updated_at = new Date();
//     const stt = 1;

//     // Insert the new product into the database
//     const [result] = await pool.execute(
//       "INSERT INTO our_product (img, title, `desc`, created_at, updated_at, stt) VALUES (?, ?, ?, ?, ?, ?)",
//       [imgPath, title, desc, created_at, updated_at, stt]
//     );

//     console.log("Item creation successful for title:", title);

//     res.json({
//       success: true,
//       message: "Item created successfully",
//       taskId: result.insertId,
//     });
//   } catch (error) {
//     console.error("Item creation error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

//Get all Our Product
// app.get("/ourproduct", async (req, res) => {
//   try {
//     const [results] = await pool.query(
//       "SELECT * FROM our_product WHERE stt = 1"
//     );

//     const modifiedResults = results.map((product) => ({
//       ...product,
//       img: product.img
//         ? `${req.protocol}://${req.get("host")}/uploads/${product.img
//             .split("/")
//             .pop()
//             .split("\\")
//             .pop()}`
//         : null,
//     }));

//     res.status(200).json(modifiedResults);
//   } catch (error) {
//     console.error("Error fetching data from the database:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to retrieve records", details: error.message });
//   }
// });

// Get one Our Product
// app.get("/ourproduct/view/:id", async (req, res) => {
//   const { id } = req.params; // Extract the 'id' from the request parameters

//   try {
//     // Use parameterized query to prevent SQL injection
//     const [results] = await pool.query(
//       "SELECT * FROM our_product WHERE our_product_id = ? AND stt = 1",
//       [id]
//     );

//     if (results.length > 0) {
//       const product = results[0];
//       const modifiedProduct = {
//         ...product,
//         img: product.img
//           ? `${req.protocol}://${req.get("host")}/uploads/${product.img
//               .split("/")
//               .pop()
//               .split("\\")
//               .pop()}`
//           : null,
//       };

//       res.status(200).json(modifiedProduct); // Send the modified product as a response
//     } else {
//       res.status(404).json({ message: "Item not found" }); // If no product is found, return 404
//     }
//   } catch (error) {
//     console.error("Error fetching Item by ID:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to retrieve record", details: error.message });
//   }
// });

// //Update Our Product
// app.put("/ourproduct/update/:id", upload.single("img"), async (req, res) => {
//   const { id } = req.params; // Extract the 'id' from the request parameters
//   const { title, desc } = req.body; // Extract the product details from the request body

//   try {
//     // First, get the current product data
//     const [currentProduct] = await pool.query(
//       "SELECT img FROM our_product WHERE our_product_id = ?",
//       [id]
//     );

//     if (currentProduct.length === 0) {
//       return res.status(404).json({ message: "Item not found" });
//     }

//     let imgPath = currentProduct[0].img; // Default to current image path

//     if (req.file) {
//       console.log("New file uploaded:", req.file);

//       // Delete the old image if it exists
//       if (imgPath) {
//         try {
//           await fs.unlink(path.join(__dirname, imgPath));
//           console.log("Old image deleted:", imgPath);
//         } catch (err) {
//           console.error("Error deleting old image:", err);
//           // Continue with the update even if old image deletion fails
//         }
//       }

//       imgPath = req.file.path; // Update imgPath with new file path
//     }

//     // Update the product in the database
//     const [result] = await pool.query(
//       "UPDATE our_product SET img = ?, title = ?, `desc` = ?, updated_at = CURRENT_TIMESTAMP WHERE our_product_id = ?",
//       [imgPath, title, desc, id]
//     );

//     if (result.affectedRows > 0) {
//       res.status(200).json({ message: "Item updated successfully" });
//     } else {
//       res.status(404).json({ message: "Item not found" });
//     }
//   } catch (error) {
//     console.error("Error updating product by ID:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to update record", details: error.message });
//   }
// });

//Delete Our product
// app.put("/ourproduct/del/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const [result] = await pool.query(
//       "UPDATE our_product SET stt = 0, updated_at = CURRENT_TIMESTAMP WHERE our_product_id = ?",
//       [id]
//     );

//     if (result.affectedRows > 0) {
//       res.status(200).json({ message: "stt field updated successfully" });
//     } else {
//       res.status(404).json({ message: "Record not found" });
//     }
//   } catch (error) {
//     console.error("Error updating stt field by ID:", error);
//     res.status(500).json({
//       error: "Failed to update stt field",
//       details: error.message,
//       stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
//     });
//   }
// });

//Create Our Partner
// app.post("/ourpartner/create", upload.single("img"), async (req, res) => {
//   try {
//     const { partner_name } = req.body;
//     console.log("Item creation attempt for parter name:", partner_name);

//     if (!partner_name) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Name is required" });
//     }

//     let imgPath = null;
//     if (req.file) {
//       console.log("Uploaded file:", req.file);
//       imgPath = req.file.path;
//     } else {
//       console.log("No file uploaded");
//     }

//     const created_at = new Date();
//     const updated_at = new Date();
//     const stt = 1;

//     // Insert the new product into the database
//     const [result] = await pool.execute(
//       "INSERT INTO our_partner (img, partner_name, created_at, updated_at, stt) VALUES (?, ?, ?, ?, ?)",
//       [imgPath, partner_name, created_at, updated_at, stt]
//     );

//     console.log("Item creation successful for partner name:", partner_name);

//     res.json({
//       success: true,
//       message: "Item created successfully",
//       taskId: result.insertId,
//     });
//   } catch (error) {
//     console.error("Item creation error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// //Get all Our Partner
// app.get("/ourpartner", async (req, res) => {
//   try {
//     const [results] = await pool.query(
//       "SELECT * FROM our_partner WHERE stt = 1"
//     );

//     const modifiedResults = results.map((items) => ({
//       ...items,
//       img: items.img
//         ? `${req.protocol}://${req.get("host")}/uploads/${items.img
//             .split("/")
//             .pop()
//             .split("\\")
//             .pop()}`
//         : null,
//     }));

//     res.status(200).json(modifiedResults);
//   } catch (error) {
//     console.error("Error fetching data from the database:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to retrieve records", details: error.message });
//   }
// });

// // Get one Our Partner
// app.get("/ourpartner/view/:id", async (req, res) => {
//   const { id } = req.params; // Extract the 'id' from the request parameters

//   try {
//     // Use parameterized query to prevent SQL injection
//     const [results] = await pool.query(
//       "SELECT * FROM our_partner WHERE our_partner_id = ? AND stt = 1",
//       [id]
//     );

//     if (results.length > 0) {
//       const item = results[0];
//       const modifiedProduct = {
//         ...item,
//         img: item.img
//           ? `${req.protocol}://${req.get("host")}/uploads/${item.img
//               .split("/")
//               .pop()
//               .split("\\")
//               .pop()}`
//           : null,
//       };

//       res.status(200).json(modifiedProduct); // Send the modified product as a response
//     } else {
//       res.status(404).json({ message: "Item not found" }); // If no partner is found, return 404
//     }
//   } catch (error) {
//     console.error("Error fetching item by ID:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to retrieve record", details: error.message });
//   }
// });

// //Update Our Partner
// app.put("/ourpartner/update/:id", upload.single("img"), async (req, res) => {
//   const { id } = req.params; // Extract the 'id' from the request parameters
//   const { partner_name } = req.body; // Extract the product details from the request body

//   try {
//     // First, get the current product data
//     const [currentItem] = await pool.query(
//       "SELECT img FROM our_partner WHERE our_partner_id = ?",
//       [id]
//     );

//     if (currentItem.length === 0) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     let imgPath = currentItem[0].img; // Default to current image path

//     if (req.file) {
//       console.log("New file uploaded:", req.file);

//       // Delete the old image if it exists
//       if (imgPath) {
//         try {
//           await fs.unlink(path.join(__dirname, imgPath));
//           console.log("Old image deleted:", imgPath);
//         } catch (err) {
//           console.error("Error deleting old image:", err);
//           // Continue with the update even if old image deletion fails
//         }
//       }

//       imgPath = req.file.path; // Update imgPath with new file path
//     }

//     // Update the partner in the database
//     const [result] = await pool.query(
//       "UPDATE our_partner SET img = ?, partner_name = ?, updated_at = CURRENT_TIMESTAMP WHERE our_partner_id = ?",
//       [imgPath, partner_name, id]
//     );

//     if (result.affectedRows > 0) {
//       res.status(200).json({ message: "Partner updated successfully" });
//     } else {
//       res.status(404).json({ message: "Pnarter not found" });
//     }
//   } catch (error) {
//     console.error("Error updating partner by ID:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to update record", details: error.message });
//   }
// });

// //Delete Our partner
// app.put("/ourpartner/del/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const [result] = await pool.query(
//       "UPDATE our_partner SET stt = 0, updated_at = CURRENT_TIMESTAMP WHERE our_partner_id = ?",
//       [id]
//     );

//     if (result.affectedRows > 0) {
//       res.status(200).json({ message: "stt field updated successfully" });
//     } else {
//       res.status(404).json({ message: "Record not found" });
//     }
//   } catch (error) {
//     console.error("Error updating stt field by ID:", error);
//     res.status(500).json({
//       error: "Failed to update stt field",
//       details: error.message,
//       stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
//     });
//   }
// });

// Get All Contact
app.get("/contact", async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM contact WHERE stt = 1");
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching data from the database:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve records", details: error.message });
  }
});

//Get One Contact
app.get("/contact/:id", async (req, res) => {
  const { id } = req.params; // Extract the 'id' from the request parameters

  try {
    // Use parameterized query to prevent SQL injection
    const [result] = await pool.query(
      "SELECT * FROM contact WHERE contact_id = ?",
      [id]
    );

    if (result.length > 0) {
      res.status(200).json(result[0]); // Send the first matching contact as a response
    } else {
      res.status(404).json({ message: "Contact not found" }); // If no contact is found, return 404
    }
  } catch (error) {
    console.error("Error fetching contact by ID:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve record", details: error.message });
  }
});

//Update Contact
app.put("/contact/update/:id", async (req, res) => {
  const { id } = req.params; // Extract the 'id' from the request parameters
  const { phone_number, email, address_url, address } = req.body; // Extract the contact details from the request body

  try {
    // Use parameterized query to update the contact record, preventing SQL injection
    const [result] = await pool.query(
      "UPDATE contact SET phone_number = ?, email = ?, address_url = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE contact_id = ?",
      [phone_number, email, address_url, address, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Contact updated successfully" }); // Respond with success if a record was updated
    } else {
      res.status(404).json({ message: "Contact not found" }); // If no record was updated, return 404
    }
  } catch (error) {
    console.error("Error updating contact by ID:", error);
    res
      .status(500)
      .json({ error: "Failed to update record", details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
