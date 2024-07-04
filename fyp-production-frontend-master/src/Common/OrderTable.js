

import React from 'react';

const TableItem = ({ order, onClick }) => {
    const { medicine_id, price, distributor, quantity, status } = order;

    const handleAccept = () => {
        onClick("Accepted", order.order_id);
    };

    const handleReject = () => {
        onClick("Rejected", order.order_id);
    };

    return (
        <tr>
            <td className="text-center text-muted">{medicine_id}</td>
            <td>
                <div className="widget-content-left flex2">
                    <div className="widget-heading">{distributor}</div>
                </div>
            </td>
            <td className="text-center">{price} ETH</td>
            <td className="text-center">{quantity}</td>
            <td className="text-center">
                {status.toLowerCase() === "pending" && (
                    <div className="badge badge-warning">{status}</div>
                )}
                {status.toLowerCase() === "accepted" && (
                    <div className="badge badge-success">{status}</div>
                )}
                {status.toLowerCase() === "rejected" && (
                    <div className="badge badge-danger">{status}</div>
                )}
            </td>
            <td className="text-center">
                {status.toLowerCase() === "pending" ? (
                    <div>
                        <button
                            onClick={handleAccept}
                            type="button"
                            className="btn btn-primary btn-sm"
                            aria-label="Accept Order"
                        >
                            Accept
                        </button>
                        &nbsp;
                        <button
                            onClick={handleReject}
                            type="button"
                            className="btn btn-danger btn-sm"
                            aria-label="Reject Order"
                        >
                            Reject
                        </button>
                    </div>
                ) : (
                    <i>No Action</i>
                )}
            </td>
        </tr>
    );
};

const TableHead = () => {
    return (
        <thead>
            <tr>
                <th className="text-center">Medicine ID</th>
                <th>Distributor</th>
                <th className="text-center">Price</th>
                <th className="text-center">Quantity</th>
                <th className="text-center">Status</th>
                <th className="text-center">Actions</th>
            </tr>
        </thead>
    );
};


const OrderTable = ({ onClick = () => {}, orders }) => {
    return (
        <div className="table-responsive">
            <table className="align-middle mb-0 table table-borderless table-striped table-hover">
                <TableHead />
                <tbody>
                    {orders.map((order, index) => (
                        <TableItem key={index} order={order} onClick={onClick} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderTable;
