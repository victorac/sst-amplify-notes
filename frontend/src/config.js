const config = {
    STRIPE_KEY: "pk_test_51LsWjOGiSWlQYnI3Gdf5HVqS5wCWbX1zWM7nJOkzv7Y37xOWq5pvbjKZuTA0y3gFLyqXp10w3mEKq8m094Ksyy4600AqPSjjcO",
    // Backend config
    s3: {
        REGION: process.env.REACT_APP_REGION,
        BUCKET: process.env.REACT_APP_BUCKET,
    },
    apiGateway: {
        REGION: process.env.REACT_APP_REGION,
        URL: process.env.REACT_APP_API_URL,
    },
    cognito: {
        REGION: process.env.REACT_APP_REGION,
        USER_POOL_ID: process.env.REACT_APP_USER_POOL_ID,
        APP_CLIENT_ID: process.env.REACT_APP_USER_POOL_CLIENT_ID,
        IDENTITY_POOL_ID: process.env.REACT_APP_IDENTITY_POOL_ID,
    },
    MAX_ATTACHMENT_SIZE: 5000000,
};

export default config;