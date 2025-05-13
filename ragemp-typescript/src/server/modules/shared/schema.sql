-- Esquema básico para o banco de dados
CREATE TABLE IF NOT EXISTS atm (
    id SERIAL PRIMARY KEY,
    balance NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    atm_id INT REFERENCES atm(id),
    amount NUMERIC NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);