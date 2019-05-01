const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const mutations = {
    async createAdmin(parent, args, ctx, info) {
        // Grab the data.
        const newAdmin = {...args};

        // Convert the email to lowercase.
        newAdmin.email = newAdmin.email.toLowerCase();

        // Verify that the password matches the verification.
        if (newAdmin.password !== newAdmin.verifyPassword) {
            throw new Error('Your passwords do not match.');
        }

        // Hash the password
        const password = await bcrypt.hash(newAdmin.password, 8);

        // Delete unnecessary keys for spreading.
        delete newAdmin.password;
        delete newAdmin.verifyPassword;

        const admin = await ctx.db.mutation.createAdmin(
            {
                data: {
                    ...newAdmin,
                    password
                }
            },
            info
        );

        // Create the admin JWT
        const adminToken = jwt.sign({
            adminId: admin.id
        }, process.env.APP_SECRET);

        // Set the cookie on response.
        ctx.response.cookie('admin_token', adminToken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365
        });

        // Return the admin
        return admin;
    }
};

module.exports = mutations;
