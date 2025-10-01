import { useEffect, useMemo, useRef, useState } from "react";
import * as RW from "react-window";

const UseGrid = RW.FixedSizeGrid || RW.Grid; 

export default function CardsGrid({
  items,
  onSelect,
  onPreview,
  height = 520,
  minColumnWidth = 260,
  gap = 16,
  cardHeight = 168,
}) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(0);

  // измеряем ширину контейнера (ResizeObserver)
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(Math.floor(entry.contentRect.width));
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // кол-во колонок и фактическая ширина карточки
  const cols = useMemo(() => {
    if (width === 0) return 1;
    return Math.max(1, Math.floor((width + gap) / (minColumnWidth + gap)));
  }, [width, gap, minColumnWidth]);

  const columnWidth = useMemo(() => {
    if (cols === 0) return minColumnWidth;
    const totalGaps = gap * (cols + 1);
    return Math.max(minColumnWidth, Math.floor((width - totalGaps) / cols));
  }, [width, cols, gap, minColumnWidth]);

  const rowCount = Math.ceil(items.length / cols);

  // единый рендер ячейки для обеих версий
  const BaseCell = ({ columnIndex, rowIndex, style }) => {
    const idx = rowIndex * cols + columnIndex;
    if (idx >= items.length) return null;
    const p = items[idx];

    const cellStyle = {
      ...style,
      left: style.left + gap,
      top: style.top + gap,
      width: columnWidth,
      height: style.height - gap,
      padding: 0,
    };

    return (
      <div style={cellStyle}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelect?.(p.id)}
          onDoubleClick={() => onPreview?.(p.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSelect?.(p.id);
            if (e.code === "Space") {
              e.preventDefault();
              onPreview?.(p.id);
            }
          }}
          className="bg-white border border-eco-border rounded-2xl shadow-soft p-4 h-full hover:bg-black/[0.02] focus:outline-none focus:ring-2 focus:ring-eco-green/50 cursor-pointer"
          title={p.fio}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold truncate">{p.fio}</div>
              <div className="text-eco-mute text-xs truncate">
                {p.city} • {new Date(p.birth).toLocaleDateString("ru-RU")}
              </div>
            </div>
            <span
              className={`inline-flex items-center h-7 px-2.5 rounded-full text-xs whitespace-nowrap ${
                p.status === "активен"
                  ? "bg-eco-green/40"
                  : p.status === "на паузе"
                  ? "bg-eco-yellow/60"
                  : "bg-eco-blue/40"
              }`}
              title={p.status}
            >
              {p.status}
            </span>
          </div>

          <div className="mt-3 space-y-1 text-sm">
            <div className="truncate"><span className="text-eco-mute">Email: </span>{p.email}</div>
            <div><span className="text-eco-mute">Телефон: </span>{p.phone}</div>
          </div>
        </div>
      </div>
    );
  };

  const CellV2 = (props) => {
    const columnIndex = props.columnIndex ?? props.column ?? props.col ?? 0;
    const rowIndex = props.rowIndex ?? props.row ?? props.r ?? 0;
    return <BaseCell columnIndex={columnIndex} rowIndex={rowIndex} style={props.style || {}} />;
  };

  return (
    <div ref={wrapRef} style={{ height }} className="relative">
      {width > 0 && UseGrid && (
        RW.FixedSizeGrid ? (
          // v1 API
          <RW.FixedSizeGrid
            columnCount={cols}
            columnWidth={columnWidth + gap}   
            height={height}
            rowCount={rowCount}
            rowHeight={cardHeight + gap}     
            width={width}
            overscanRowCount={2}
            overscanColumnCount={1}
          >
            {BaseCell}
          </RW.FixedSizeGrid>
        ) : (
          <RW.Grid
            columnCount={cols}
            columnWidth={columnWidth + gap}
            height={height}
            rowCount={rowCount}
            rowHeight={cardHeight + gap}
            width={width}
            cellComponent={CellV2}
            cellProps={{}}
            overscanCount={2}
          />
        )
      )}
    </div>
  );
}
