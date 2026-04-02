from pyteal import *

def approval_program():
    on_create = Seq(
        App.globalPut(Bytes("creator"), Txn.sender()),
        App.globalPut(Bytes("batch_count"), Int(0)),
        App.globalPut(Bytes("event_anchor_count"), Int(0)),
        Return(Int(1))
    )

    create_batch = Seq(
        Assert(Txn.application_args.length() > Int(0)),
        Assert(Txn.application_args[0] == Bytes("create_batch")),
        App.globalPut(
            Bytes("batch_count"),
            App.globalGet(Bytes("batch_count")) + Int(1)
        ),
        Return(Int(1))
    )

    anchor_event = Seq(
        Assert(Txn.application_args.length() > Int(0)),
        Assert(Txn.application_args[0] == Bytes("anchor_event")),
        App.globalPut(
            Bytes("event_anchor_count"),
            App.globalGet(Bytes("event_anchor_count")) + Int(1)
        ),
        Return(Int(1))
    )

    handle_noop = Cond(
        [Txn.application_args[0] == Bytes("create_batch"), create_batch],
        [Txn.application_args[0] == Bytes("anchor_event"), anchor_event]
    )

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