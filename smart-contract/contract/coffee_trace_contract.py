from pyteal import *

def approval_program():
    on_create = Seq(
        App.globalPut(Bytes("creator"), Txn.sender()),
        Return(Int(1))
    )

    handle_noop = Return(Int(1))

    return Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.NoOp, handle_noop]
    )

def clear_state_program():
    return Return(Int(1))

if __name__ == "__main__":
    with open("/workspaces/brewchain/smart-contract/artifacts/approval.teal", "w") as f:
        f.write(compileTeal(approval_program(), mode=Mode.Application, version=8))

    with open("/workspaces/brewchain/smart-contract/artifacts/clear.teal", "w") as f:
        f.write(compileTeal(clear_state_program(), mode=Mode.Application, version=8))