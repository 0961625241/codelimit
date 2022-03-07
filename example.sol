  function makeBNBTokenSwap(address owner, address tokenIn, address tokenOut, address pair, uint256 amountIn, uint256 minAmountOut) external payable onlyAuthorized {
    // Swap bnb for wbnb then transfer to pair
    IWBNB(WBNB).deposit{value: amountIn}();
    assert(IWBNB(WBNB).transfer(pair, amountIn));
    
    uint balanceBefore = IBEP20(tokenOut).balanceOf(owner);
    _swap(pair, tokenIn, tokenOut, owner);
    
    require(
        IBEP20(tokenOut).balanceOf(owner).sub(balanceBefore) >= minAmountOut,
        'BogRouter: INSUFFICIENT_OUTPUT_AMOUNT'
    );
}
function swapExactETHForTokens(
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
) external virtual override payable ensure(deadline) returns (uint256[] memory amounts) {
    require(path[0] == WETH, "UniswapV2Router: INVALID_PATH");
    amounts = UniswapV2Library.getAmountsOut(factory, msg.value, path);
    require(
        amounts[amounts.length - 1] >= amountOutMin,
        "UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT"
    );
    IWETH(WETH).deposit{value: amounts[0]}();
    assert(
        IWETH(WETH).transfer(
            UniswapV2Library.pairFor(factory, path[0], path[1]),
            amounts[0]
        )
    );
    _swap(amounts, path, to);
}
  function makeTokenBNBSwap(address owner, address tokenIn, address tokenOut, address pair, uint256 amountIn, uint256 minAmountOut) external onlyAuthorized {
        TransferHelper.safeTransferFrom(
            tokenIn, owner, pair, amountIn
        );
        
        uint balanceBefore = IBEP20(WBNB).balanceOf(address(this));
        _swap(pair, tokenIn, tokenOut, address(this));
        
        uint amountOut = IBEP20(WBNB).balanceOf(address(this)).sub(balanceBefore);
        
        require(amountOut >= minAmountOut, 'BogRouter: INSUFFICIENT_OUTPUT_AMOUNT');
        
        IWBNB(WBNB).withdraw(amountOut);
        
        TransferHelper.safeTransferETH(owner, amountOut);
    }
    function swapExactTokensForETH(

        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external virtual override ensure(deadline) returns (uint256[] memory amounts) {
        require(path[path.length - 1] == WETH, "UniswapV2Router: INVALID_PATH");
        amounts = UniswapV2Library.getAmountsOut(factory, amountIn, path);
        require(
            amounts[amounts.length - 1] >= amountOutMin,
            "UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT"
        );
        TransferHelper.safeTransferFrom(
            path[0],
            msg.sender,
            UniswapV2Library.pairFor(factory, path[0], path[1]),
            amounts[0]
        );
        _swap(amounts, path, address(this));
        IWETH(WETH).withdraw(amounts[amounts.length - 1]);
        TransferHelper.safeTransferETH(to, amounts[amounts.length - 1]);
    }
  

    function _swap(
        uint256[] memory amounts,
        address[] memory path,
        address _to
    ) internal virtual {
        for (uint256 i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0, ) = UniswapV2Library.sortTokens(input, output);
            uint256 amountOut = amounts[i + 1];
            (uint256 amount0Out, uint256 amount1Out) = input == token0
                ? (uint256(0), amountOut)
                : (amountOut, uint256(0));
            address to = i < path.length - 2
                ? UniswapV2Library.pairFor(factory, output, path[i + 2])
                : _to;
            IUniswapV2Pair(UniswapV2Library.pairFor(factory, input, output))
                .swap(amount0Out, amount1Out, to, new bytes(0));
        }
    }

    

  uint256 id;                 // Order ID 
        uint256 pendingIndex;       // Index in pending order array
        address owner;              // Order placer 
        OrderStatus status;         // Order status 
        OrderType swapType;         // Order type
        address tokenIn;            // Token to swap 
        address tokenOut;           // Token to swap for
        address pair;               // PancakeswapPair
        uint256 amountIn;           // BNB Amount in 
        uint256 targetAmountOut;    // Price to trigger order at 
        uint256 minAmountOut;       // Max price to trigger order at (in case price changed before tx has been mined)
        uint256 timestamp;      
ord.owner, ord.tokenIn, ord.tokenOut, ord.pair, ord.amountIn, ord.minAmountOut
       function makeTokenTokenSwap(address owner, address tokenIn, address tokenOut, address pair, uint256 amountIn, uint256 minAmountOut) external onlyAuthorized {
        TransferHelper.safeTransferFrom(
            tokenIn, owner, pair, amountIn
        );
        
        uint balanceBefore = IBEP20(tokenOut).balanceOf(owner);
        _swap(pair, tokenIn, tokenOut, owner);
        
        require(
            IBEP20(tokenOut).balanceOf(owner).sub(balanceBefore) >= minAmountOut,
            'BogRouter: INSUFFICIENT_OUTPUT_AMOUNT'
        );
    }
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external virtual override ensure(deadline) returns (uint256[] memory amounts) {
        amounts = UniswapV2Library.getAmountsOut(factory, amountIn, path);
        require(
            amounts[amounts.length - 1] >= amountOutMin,
            "UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT"
        );
        TransferHelper.safeTransferFrom(
            path[0],
            msg.sender,
            UniswapV2Library.pairFor(factory, path[0], path[1]),
            amounts[0]
        );
        _swap(amounts, path, to);
    }
