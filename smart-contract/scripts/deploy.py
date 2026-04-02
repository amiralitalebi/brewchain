import base64
import os
from algosdk.v2client import algod
from algosdk import account, mnemonic, transaction

ALGOD_ADDRESS = os.getenv("ALGOD_ADDRESS", "http://localhost:4001")
ALGOD_TOKEN = os.getenv("ALGOD_TOKEN", "a" * 64)
ALGOD_MNEMONIC = os.getenv("ALGOD_MNEMONIC")

if not ALGOD_MNEMONIC:
    raise ValueError("ALGOD_MNEMONIC is not set")

client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)
private_key = mnemonic.to_private_key(ALGOD_MNEMONIC)
sender = account.address_from_private_key(private_key)

with open("/workspaces/brewchain/smart-contract/artifacts/approval.teal", "r") as f:
    approval_teal = f.read()

with open("/workspaces/brewchain/smart-contract/artifacts/clear.teal", "r") as f:
    clear_teal = f.read()

approval_result = client.compile(approval_teal)
clear_result = client.compile(clear_teal)

approval_program = base64.b64decode(approval_result["result"])
clear_program = base64.b64decode(clear_result["result"])

global_schema = transaction.StateSchema(num_uints=2, num_byte_slices=1)
local_schema = transaction.StateSchema(num_uints=0, num_byte_slices=0)

params = client.suggested_params()

txn = transaction.ApplicationCreateTxn(
    sender=sender,
    sp=params,
    on_complete=transaction.OnComplete.NoOpOC.real,
    approval_program=approval_program,
    clear_program=clear_program,
    global_schema=global_schema,
    local_schema=local_schema,
)

signed_txn = txn.sign(private_key)
tx_id = client.send_transaction(signed_txn)
result = transaction.wait_for_confirmation(client, tx_id, 4)

print("DEPLOYED_APP_ID=", result["application-index"])
print("TX_ID=", tx_id)
