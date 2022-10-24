## CreditCapital Database Backend

### The Database backend exists to provide historic price data about the movement of CAPL. This service runs in order to pull up to date price data from the chain and store it in a centralized database. This data is then made available to the web3 DApp in order to accurately calculate daily/weekly/monthly price movements of CAPL as well as user's positions.

## Supabase Price DB Schema
id	bigint	int8
usdc_balance	text	text
capl_balance	text	text
prices	json	json
fetch_start_time	timestamp with time zone	timestamptz
fetch_end_time	timestamp with time zone	timestamptz
created_at	timestamp with time zone	timestamptz
