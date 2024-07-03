// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IMedisecure {
    struct Medicine {
        string medicine_id;
        string name;
        string description;
        string manufacturer;
        string category;
        string formula;
        string chemicals;
        string medicine_type;
    }

    function add_medicine(
        string calldata medicine_id,
        string calldata name,
        string calldata description,
        string calldata manufacturer,
        string calldata category,
        string calldata formula,
        string calldata chemicals,
        string calldata medicine_type
    ) external returns (bool);

    function view_medicine_by_manufacturer(string calldata manufacturer)
        external
        view
        returns (Medicine[] memory);

    function view_all_medicines() external view returns (Medicine[] memory);

    struct Stock {
        string stock_id;
        string medicine_id;
        uint256 price;
        uint256 quantity;
        uint256 manufacture_date;
        uint256 expiry_date;
    }

    function add_stock(
        string calldata stock_id,
        string calldata medicine_id,
        uint256 price,
        uint256 quantity,
        uint256 manufacture_date,
        uint256 expiry_date
    ) external returns (bool);

    function view_stocks_by_medicine_id(string calldata medicine_id)
        external
        view
        returns (Stock[] memory);

    function view_all_stocks() external view returns (Stock[] memory);

    function view_stocks_by_manufacturer(string calldata manufacturer)
        external
        view
        returns (Stock[] memory);

    struct Order {
        string order_id;
        string medicine_id;
        uint256 price;
        uint256 quantity;
        uint256 total_price;
        string distributor;
        string status;
    }

    function add_order(
        string calldata order_id,
        string calldata medicine_id,
        uint256 quantity,
        string calldata distributor
    ) external returns (bool);

    function view_order_by_id(string calldata order_id)
        external
        view
        returns (Order memory);

    function view_all_orders() external view returns (Order[] memory);

    function view_orders_by_distributor(string calldata distributor)
        external
        view
        returns (Order[] memory);
}

contract Medisecure is IMedisecure {
    mapping(string => Medicine[]) private medicinesByManufacturer;
    mapping(string => Medicine) private medicinesById;
    string[] private medicineIds;

    function add_medicine(
        string memory medicine_id,
        string memory name,
        string memory description,
        string memory manufacturer,
        string memory category,
        string memory formula,
        string memory chemicals,
        string memory medicine_type
    ) external override returns (bool) {
        Medicine memory medicine = Medicine(
            medicine_id,
            name,
            description,
            manufacturer,
            category,
            formula,
            chemicals,
            medicine_type
        );
        medicinesByManufacturer[manufacturer].push(medicine);
        medicinesById[medicine_id] = medicine;
        medicineIds.push(medicine_id);
        return true;
    }

    function view_medicine_by_manufacturer(string calldata manufacturer)
        external
        view
        override
        returns (Medicine[] memory)
    {
        return medicinesByManufacturer[manufacturer];
    }

    function view_all_medicines()
        external
        view
        override
        returns (Medicine[] memory)
    {
        uint256 totalMedicines = medicineIds.length;
        Medicine[] memory allMedicines = new Medicine[](totalMedicines);
        for (uint256 i = 0; i < totalMedicines; i++) {
            allMedicines[i] = medicinesById[medicineIds[i]];
        }
        return allMedicines;
    }

    mapping(string => Stock[]) private stocksByMedicineId;
    mapping(string => Stock) private stocksById;
    mapping(string => Stock[]) private stocksByManufacturer;
    string[] private stockIds;

    function add_stock(
        string calldata stock_id,
        string calldata medicine_id,
        uint256 price,
        uint256 quantity,
        uint256 manufacture_date,
        uint256 expiry_date
    ) external override returns (bool) {
        require(bytes(medicine_id).length > 0, "Invalid medicine ID");
        require(
            bytes(medicinesById[medicine_id].medicine_id).length > 0,
            "Medicine does not exist"
        );

        Stock memory stock = Stock(
            stock_id,
            medicine_id,
            price,
            quantity,
            manufacture_date,
            expiry_date
        );

        stocksByMedicineId[medicine_id].push(stock);
        stocksByManufacturer[medicinesById[medicine_id].manufacturer].push(
            stock
        );
        stocksById[stock_id] = stock;
        stockIds.push(stock_id);
        return true;
    }

    function view_stocks_by_manufacturer(string calldata manufacturer)
        external
        view
        override
        returns (Stock[] memory)
    {
        return stocksByManufacturer[manufacturer];
    }

    function view_stocks_by_medicine_id(string calldata medicine_id)
        external
        view
        override
        returns (Stock[] memory)
    {
        return stocksByMedicineId[medicine_id];
    }

    function view_all_stocks() external view override returns (Stock[] memory) {
        uint256 totalStocks = stockIds.length;
        Stock[] memory allStocks = new Stock[](totalStocks);
        for (uint256 i = 0; i < totalStocks; i++) {
            allStocks[i] = stocksById[stockIds[i]];
        }
        return allStocks;
    }

    mapping(string => Order) private ordersById;
    mapping(string => Order[]) private ordersByDistributor;
    string[] private orderIds;

    function add_order(
        string calldata order_id,
        string calldata medicine_id,
        uint256 quantity,
        string calldata distributor
    ) external override returns (bool) {
        require(bytes(medicine_id).length > 0, "Invalid medicine ID");
        require(quantity > 0, "Quantity must be greater than zero");

        // Find the appropriate stock
        Stock[] storage stocks = stocksByMedicineId[medicine_id];
        require(stocks.length > 0, "No stock available for this medicine");

        uint256 totalPrice = 0;
        uint256 remainingQuantity = quantity;

        for (uint256 i = 0; i < stocks.length && remainingQuantity > 0; i++) {
            Stock storage stock = stocks[i];
            if (stock.quantity >= remainingQuantity) {
                totalPrice += remainingQuantity * stock.price;
                stock.quantity -= remainingQuantity;
                remainingQuantity = 0;
            } else {
                totalPrice += stock.quantity * stock.price;
                remainingQuantity -= stock.quantity;
                stock.quantity = 0;
            }
        }

        require(remainingQuantity == 0, "Insufficient stock available");

        // Create and store the order
        Order memory order = Order(
            order_id,
            medicine_id,
            totalPrice / quantity, // price per unit
            quantity,
            totalPrice,
            distributor,
            "pending" // Default status
        );
        ordersById[order_id] = order;
        ordersByDistributor[distributor].push(order);
        orderIds.push(order_id);
        return true;
    }

    function view_order_by_id(string calldata order_id)
        external
        view
        override
        returns (Order memory)
    {
        return ordersById[order_id];
    }

    function view_all_orders() external view override returns (Order[] memory) {
        uint256 totalOrders = orderIds.length;
        Order[] memory allOrders = new Order[](totalOrders);
        for (uint256 i = 0; i < totalOrders; i++) {
            allOrders[i] = ordersById[orderIds[i]];
        }
        return allOrders;
    }

    function view_orders_by_distributor(string calldata distributor)
        external
        view
        override
        returns (Order[] memory)
    {
        return ordersByDistributor[distributor];
    }
}
