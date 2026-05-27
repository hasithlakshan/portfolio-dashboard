process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://portfolio:portfolio_pass@localhost:5433/portfolio_db';
process.env.JWT_SECRET = 'test_jwt_secret_for_testing_purposes_only_32chars';
process.env.JWT_EXPIRES_IN = '1h';
process.env.PORT = '3001';
process.env.CORS_ORIGIN = 'http://localhost:5173';
