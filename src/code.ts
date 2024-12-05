type Sort = "position" | "random" | "width_asc" | "width_des" | "height_asc" | "height_des" | "area_asc" | "area_des" | "alpha_asc" | "alpha_des";
type Alignment = "TL" | "TC" | "TR" | "ML" | "MC" | "MR" | "BL" | "BC" | "BR";
type figmaNode =
    | RectangleNode
    | FrameNode
    | GroupNode
    | EllipseNode
    | LineNode
    | PolygonNode
    | BooleanOperationNode
    | ComponentNode
    | ComponentSetNode
    | InstanceNode
    | TextNode
    | SliceNode
    | VectorNode
    | StarNode;
type gridOption = {
    columnCount: "Auto" | number | string;
    columnWidth: "Auto" | number;
    columnGap: "Auto" | number;
    rowCount: "Auto" | number | string;
    rowHeight: "Auto" | number;
    rowGap: "Auto" | number;
};
type alignOpt = {
    x: number;
    y: number;
    width: number;
    height: number;
    column_width: number;
    row_height: number;
};

let sortBy: Sort = "position";
let includeLockedLayers = false;
let alignment: Alignment = "TL";
let nodes: figmaNode[];

function tidify(config: gridOption) {
    // @ts-ignore
    nodes = [...figma.currentPage.selection];

    // Selection Count handling
    if (nodes.length == 0) {
        figma.notify("⚠️ You haven't selected any nodes yet, kindly select bunch of nodes");
        return;
    } else if (nodes.length == 1) {
        figma.notify("⚠️ kindly select atleast more than one node");
        return;
    }

    // handling locked nodes
    let lockedNodes = nodes.filter((node) => node.locked);
    if (includeLockedLayers) lockedNodes.forEach((e) => (e.locked = false));

    // handling sort
    function sortNodes(nodes: figmaNode[], type: Sort) {
        switch (type) {
            case "random":
                let n = nodes.length;
                let i, tmp;
                while (n) {
                    i = Math.floor(Math.random() * n--);
                    tmp = nodes[n];
                    nodes[n] = nodes[i];
                    nodes[i] = tmp;
                }
                break;

            case "position":
                nodes.sort((a, b) => {
                    if (a.y > b.y) return 1;
                    if (a.y < b.y) return -1;
                    if (a.x > b.x) return 1;
                    if (a.x < b.x) return -1;
                    return 0;
                });
                break;

            case "height_asc":
                nodes.sort((a, b) => {
                    if (a.height > b.height) return 1;
                    if (a.height < b.height) return -1;
                    return 0;
                });
                break;

            case "height_des":
                nodes.sort((a, b) => {
                    if (a.height > b.height) return -1;
                    if (a.height < b.height) return +1;
                    return 0;
                });
                break;

            case "width_asc":
                nodes.sort((a, b) => {
                    if (a.width > b.width) return 1;
                    if (a.width < b.width) return -1;
                    return 0;
                });
                break;

            case "width_des":
                nodes.sort((a, b) => {
                    if (a.width > b.width) return -1;
                    if (a.width < b.width) return +1;
                    return 0;
                });
                break;

            case "area_asc":
                nodes.sort((a, b) => {
                    let a_area = a.height * a.width;
                    let b_area = b.height * b.width;
                    if (a_area > b_area) return 1;
                    if (a_area < b_area) return -1;
                    return 0;
                });
                break;

            case "area_des":
                nodes.sort((a, b) => {
                    let a_area = a.height * a.width;
                    let b_area = b.height * b.width;
                    if (a_area > b_area) return -1;
                    if (a_area < b_area) return +1;
                    return 0;
                });
                break;

            case "alpha_asc":
                nodes.sort((a, b) => {
                    if (a.name > b.name) return 1;
                    if (a.name < b.name) return -1;
                    return 0;
                });
                break;

            case "alpha_des":
                nodes.sort((a, b) => {
                    if (a.name > b.name) return -1;
                    if (a.name < b.name) return 1;
                    return 0;
                });
                break;
        }
    }
    sortNodes(nodes, sortBy);

    // Arrange nodes in grid
    arrangeNodes(config);

    // hanlding back locked nodes
    lockedNodes.forEach((e) => (e.locked = true));
}

function arrangeNodes(config: gridOption) {
    let n = nodes.length;
    let column_cnt = config.columnCount;
    // denotes the grid is based on column count;
    // it'll be false if column count set to auto and row count has value
    let col_based_grid = true;
    let row_cnt = config.rowCount;
    let column_width = config.columnWidth;
    let column_width_ary: number[];
    let row_height = config.rowHeight;
    let row_height_ary: number[];
    let column_gap = config.columnGap;
    let row_gap = config.rowGap;
    let origin: number[] = nodes.reduce((a, el) => [Math.min(a[0], el.x), Math.min(a[1], el.y)], [nodes[0].x, nodes[0].y]);

    /* Handling row and column count
  ==========================================*/

    // Edge Case: if both column_cnt and row_cnt has value
    if (column_cnt !== "Auto" && row_cnt !== "Auto") row_cnt = "Auto";

    // Handling Auto column and Auto row count
    if (row_cnt === "Auto" && column_cnt === "Auto") {
        column_cnt = Math.round(Math.sqrt(n));
        row_cnt = Math.ceil(n / column_cnt);
    }
    // Handling Auto column count
    else if (row_cnt !== "Auto" && column_cnt == "Auto") {
        row_cnt = parseInt(row_cnt as string);
        if (n < row_cnt || n == row_cnt) {
            column_cnt = 1;
        } else {
            col_based_grid = false;
            column_cnt = Math.ceil(n / row_cnt);
        }
    }
    // Handling Auto row count
    else if (row_cnt === "Auto" && column_cnt != "Auto") {
        column_cnt = parseInt(column_cnt as string);
        row_cnt = Math.ceil(n / column_cnt);
    }

    /* Grid Structure
  ==========================================*/
    let grid = [];
    let altNodes = [...nodes];
    if (col_based_grid) {
        for (let i = 1; i <= (row_cnt as number); i++) {
            grid.push(altNodes.splice(0, column_cnt as number));
        }
    } else {
        // Total possible combination
        let m = (row_cnt as number) * (column_cnt as number);
        function numberTheAry(ary: any[]): number[][] {
            let cnt = -1;
            return ary.map((row) => {
                return row.map(() => {
                    cnt++;
                    return cnt;
                });
            });
        }
        grid = createAry(row_cnt as number, createAry(column_cnt as number, 0));
        grid = numberTheAry(grid);

        for (let i = 0; i < m - n; i++) {
            let q = grid.length - 1 - i;
            grid[q].pop();
        }
        grid = numberTheAry(grid);
        grid = grid.map((row) => row.map((el) => nodes[el]));
    }

    /* Handling row and column Width
  ==========================================*/

    // Handling Auto column and Auto row width
    if (column_width === "Auto") {
        column_width_ary = (grid as figmaNode[][]).reduce((a: number[], row: figmaNode[]) => {
            let columnWidths: number[] = row.map((e: figmaNode) => e.width);
            return a.map((a, i) => Math.round(Math.max(a, columnWidths[i] || 0)));
        }, createAry(column_cnt as number, 0));
    } else {
        column_width_ary = createAry(column_cnt as number, +column_width);
    }

    if (row_height === "Auto") {
        row_height_ary = (grid as figmaNode[][]).reduce((a: number[], row: figmaNode[]) => {
            let rowHeights = row.map((e: figmaNode) => e.height);
            a.push(Math.round(Math.max(...rowHeights)));
            return a;
        }, []);
    } else {
        row_height_ary = createAry(row_cnt as number, +row_height);
    }

    /* Handling row and column Gap
  ==========================================*/
    function getColumnGap() {
        let maxWidth = Math.max(...column_width_ary);
        return Math.round(maxWidth * 0.25);
    }

    function getRowGap() {
        let maxHeight = Math.max(...row_height_ary);
        return Math.round(maxHeight * 0.25);
    }

    // Handling Auto column gap
    if (column_gap === "Auto" && row_gap !== "Auto") {
        column_gap = getColumnGap();
    }
    // Handling Auto row gap
    else if (row_gap === "Auto" && column_gap !== "Auto") {
        row_gap = getRowGap();
    }
    // Handling Auto row and column gap
    else if (column_gap === "Auto" && row_gap === "Auto") {
        let gap = Math.max(getColumnGap(), getRowGap());
        column_gap = gap;
        row_gap = gap;
    }

    /* Arranging Nodes
  ==========================================*/
    (grid as figmaNode[][]).forEach((row, row_index) => {
        row.forEach((el, column_index) => {
            let cur_col_gap = column_index * +column_gap;
            let cur_row_gap = row_index * +row_gap;

            let left_offset = +column_width_ary.slice(0, column_index).reduce((a, e) => a + e, 0);
            let top_offset = +row_height_ary.slice(0, row_index).reduce((a, e) => a + e, 0);

            let x = origin[0] + left_offset + cur_col_gap;
            let y = origin[1] + top_offset + cur_row_gap;

            if (alignment !== "TL") {
                let alignOption: alignOpt = {
                    x,
                    y,
                    width: el.width,
                    height: el.height,
                    column_width: column_width_ary[column_index],
                    row_height: row_height_ary[row_index],
                };
                [x, y] = getAlignedCord(alignOption);
            }

            el.x = x;
            el.y = y;
        });
    });

    function createAry<type>(length: number, fillElements: type) {
        let ary = [];
        for (let i = 0; i < length; i++) {
            ary.push(fillElements);
        }
        return ary;
    }

    function getAlignedCord(option: alignOpt): number[] {
        let x = option.x;
        let y = option.y;
        let width = option.width;
        let height = option.height;
        let col_width = option.column_width;
        let row_height = option.row_height;
        let x1: number, y1: number;

        switch (alignment) {
            case "TC":
                x1 = x + col_width / 2 - width / 2;
                y1 = y;
                break;

            case "TR":
                x1 = x + col_width - width;
                y1 = y;
                break;

            case "ML":
                x1 = x;
                y1 = y + row_height / 2 - height / 2;
                break;

            case "MC":
                x1 = x + col_width / 2 - width / 2;
                y1 = y + row_height / 2 - height / 2;
                break;

            case "MR":
                x1 = x + col_width - width;
                y1 = y + row_height / 2 - height / 2;
                break;

            case "BL":
                x1 = x;
                y1 = y + row_height - height;
                break;

            case "BC":
                x1 = x + col_width / 2 - width / 2;
                y1 = y + row_height - height;
                break;

            case "BR":
                x1 = x + col_width - width;
                y1 = y + row_height - height;
                break;
        }

        return [Math.round(x1!), Math.round(y1!)];
    }
}

figma.ui.onmessage = async (msg) => {
    // let resonse = await checkPayment();

    // if (resonse === "run") {
        sortBy = msg.sortBy;
        includeLockedLayers = msg.includeLockedLayers;
        alignment = msg.alignment;
        tidify(msg.config);
    // }
};

const command = figma.command;
let config: gridOption = {
    columnCount: "Auto",
    columnWidth: "Auto",
    columnGap: "Auto",
    rowCount: "Auto",
    rowHeight: "Auto",
    rowGap: "Auto",
};


switch (command) {
    case "auto":
        sortBy = "position";
        includeLockedLayers = false;
        alignment = "TL";
        tidify(config);
        figma.closePlugin("Auto tidied up selected nodes.");
        break;
    case "column":
        sortBy = "position";
        includeLockedLayers = false;
        alignment = "TL";
        config.columnCount = "1";
        tidify(config);
        figma.closePlugin("Tidied up as single column.");
        break;
    case "row":
        sortBy = "position";
        includeLockedLayers = false;
        alignment = "TL";
        config.rowCount = "1";
        tidify(config);
        figma.closePlugin("Tidied up as single row.");
        break;
    default:
        figma.showUI(__html__, { themeColors: true, height: 386, width: 280 });
}
