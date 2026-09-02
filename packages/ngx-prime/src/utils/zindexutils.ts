function ZIndexUtils() {
    let zIndexes: any = [];

    const generateZIndex = (key, baseZIndex) => {
        let lastZIndex = zIndexes.length > 0 ? zIndexes[zIndexes.length - 1] : { key, value: baseZIndex };
        let newZIndex = lastZIndex.value + (lastZIndex.key === key ? 0 : baseZIndex) + 2;

        zIndexes.push({ key, value: newZIndex });

        return newZIndex;
    };

    const revertZIndex = (zIndex) => {
        zIndexes = zIndexes.filter((obj) => obj.value !== zIndex);
    };

    const getCurrentZIndex = () => (zIndexes.length > 0 ? zIndexes[zIndexes.length - 1].value : 0);

    const getZIndex = (el) => (el ? parseInt(el.style.zIndex, 10) || 0 : 0);

    return {
        get: getZIndex,
        set: (key, el, baseZIndex) => {
            if (el) {
                el.style.zIndex = String(generateZIndex(key, baseZIndex));
            }
        },
        clear: (el) => {
            if (el) {
                revertZIndex(getZIndex(el));
                el.style.zIndex = '';
            }
        },
        getCurrent: () => getCurrentZIndex(),
        generateZIndex,
        revertZIndex,
        /**
         * Resets the shared z-index stack. Needed when rendering multiple
         * independent pages within the same process (e.g. static site
         * generation), since this state is otherwise module-scoped and
         * persists (and can accumulate stale entries) across renders.
         */
        reset: () => {
            zIndexes = [];
        }
    };
}

export default ZIndexUtils();
