const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'dataview.spec.ts');
let src = fs.readFileSync(file, 'utf8');

const fields = ["paginator","rows","totalRecords","pageLinks","rowsPerPageOptions","paginatorPosition",
"paginatorStyleClass","alwaysShowPaginator","paginatorDropdownAppendTo","paginatorDropdownScrollHeight",
"currentPageReportTemplate","showCurrentPageReport","showJumpToPageDropdown","showFirstLastIcon",
"showPageLinks","lazy","lazyLoadOnInit","emptyMessage","styleClass","gridStyleClass","trackBy",
"filterBy","filterLocale","loading","loadingIcon","first","sortField","sortOrder","layout","products"];

const alt = fields.join('|');
const re = new RegExp('component\\.(' + alt + ')\\s*=\\s*([\\s\\S]+?);', 'g');

let count = 0;
src = src.replace(re, (m, field, expr) => {
  count++;
  return 'component.' + field + '.set(' + expr + ');';
});
console.log('basic assignment replacements:', count);

fs.writeFileSync(file, src, 'utf8');
