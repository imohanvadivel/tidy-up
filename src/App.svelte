<script lang="ts">
    import { postFigma } from "$lib/util.ts";
    import { Button, Checkbox, Divider, Input, Label, SectionTitle, Select } from "figblocks";

    let config = {
        columnCount: "Auto",
        columnWidth: "Auto",
        columnGap: "Auto",
        rowCount: "Auto",
        rowHeight: "Auto",
        rowGap: "Auto",
    };

    let sortByOptions = [
        { value: "position", label: "Position", selected: true },
        { value: "height_asc", label: "Height (ascending)", selected: false },
        { value: "height_des", label: "Height (descending)", selected: false },
        { value: "width_asc", label: "Width (ascending)", selected: false },
        { value: "width_des", label: "Width (descending)", selected: false },
        { value: "area_asc", label: "Area (ascending)", selected: false },
        { value: "area_des", label: "Area (descending)", selected: false },
        { value: "random", label: "Random", selected: false },
    ];
    let alignmentOptions = [
        { value: "TL", label: "Top Left", selected: true },
        { value: "TC", label: "Top Center", selected: false },
        { value: "TR", label: "Top Right", selected: false },
        { value: "ML", label: "Middle Left", selected: false },
        { value: "MC", label: "Middle Center", selected: false },
        { value: "MR", label: "Middle Right", selected: false },
        { value: "BL", label: "Bottom Left", selected: false },
        { value: "BC", label: "Bottom Center", selected: false },
        { value: "BR", label: "Bottom Right", selected: false },
    ];

    let includeLockedLayers = false;

    function handleBlur(e: string) {
        let value = config[e];

        if (value.toLowerCase() === "auto") {
            config[e] = "Auto";
            return;
        }

        if (value === "") {
            config[e] = "Auto";
            return;
        }

        if (!parseInt(value)) {
            config[e] = "Auto";
            return;
        } else {
            if (e === "columnWidth" || e === "rowHeight") {
                value = parseFloat(value).toString();
                config[e] = value;

                let numOfDecimals = 0;
                let decimals = value.split(".")[1];
                if (decimals) numOfDecimals = decimals.length;

                if (numOfDecimals > 2) config[e] = parseFloat(value).toFixed(2);
                return;
            }

            value = parseInt(value);
            if (e === "rowCount" && config.columnCount !== "Auto") config.columnCount = "Auto";
            if (e === "columnCount" && config.rowCount !== "Auto") config.rowCount = "Auto";

            config[e] = Math.round(value).toString();
            return;
        }
    }

    function handleClick() {
        let sortBy = sortByOptions.find((e) => e.selected).value;
        let alignment = alignmentOptions.find((e) => e.selected).value;
        postFigma({ config, sortBy, alignment, includeLockedLayers });
    }
</script>

<main>
    <section class="sec columns">
        <SectionTitle>Columns</SectionTitle>
        <section class="input-wrapper">
            <div class="input">
                <Label>count</Label>
                <Input on:blur={() => handleBlur("columnCount")} bind:value={config.columnCount} />
            </div>
            <div class="input">
                <Label>Width</Label>
                <Input on:blur={() => handleBlur("columnWidth")} bind:value={config.columnWidth} />
            </div>
            <div class="input">
                <Label>Gap</Label>
                <Input on:blur={() => handleBlur("columnGap")} bind:value={config.columnGap} />
            </div>
        </section>
    </section>

    <section class="sec rows">
        <SectionTitle>Rows</SectionTitle>
        <section class="input-wrapper">
            <div class="input">
                <Label>count</Label>
                <Input on:blur={() => handleBlur("rowCount")} bind:value={config.rowCount} />
            </div>
            <div class="input">
                <Label>Height</Label>
                <Input on:blur={() => handleBlur("rowHeight")} bind:value={config.rowHeight} />
            </div>
            <div class="input">
                <Label>Gap</Label>
                <Input on:blur={() => handleBlur("rowGap")} bind:value={config.rowGap} />
            </div>
        </section>
    </section>
    <Divider />

    <aside class="sec">
        <div class="select">
            <Label>Sort by</Label>
            <Select bind:menuItems={sortByOptions} />
        </div>
        <div class="select">
            <Label>Alignment</Label>
            <Select bind:menuItems={alignmentOptions} />
        </div>
        <Checkbox bind:checked={includeLockedLayers}>Include Locked Layers in Selection</Checkbox>
    </aside>

    <footer><Button on:click={handleClick}>Tidy Up</Button></footer>
</main>

<style>
    .sec {
        padding: 0 var(--figma-size-xsmall) 0 var(--figma-size-xxsmall);
    }
    .sec.columns {
        padding-bottom: var(--figma-size-xxsmall);
    }
    .sec.rows {
        padding-bottom: var(--figma-size-xsmall);
    }

    footer {
        padding: var(--figma-size-xsmall);
    }

    .input-wrapper {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
    }
    .select {
        display: grid;
        grid-template-columns: auto 1fr;
    }
    aside {
        margin-top: var(--figma-size-xxsmall);
    }
</style>
