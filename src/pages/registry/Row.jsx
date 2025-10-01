import { useRef } from "react";
import { usePeople } from "../../store/people";

export default function Row(props) {
  const {
    index,
    style,
    rows,
    cols,
    template,
    rowClass,
    onPreview,
    selectedIds,
    onToggleSelect,
    setAnchorId,
  } = props;

  const p = rows[index];
  const select = usePeople((s) => s.select);

  const isSelected = selectedIds?.has(p.id) || false;

  const modsRef = useRef({ shift: false, ctrl: false });
  const onCbPointerDown = (e) => {
    modsRef.current = {
      shift: !!e.shiftKey,
      ctrl: !!(e.metaKey || e.ctrlKey),
    };
  };
  const onCbChange = () => {
    onToggleSelect?.(p.id, {
      range: modsRef.current.shift,
      ctrl: modsRef.current.ctrl,
    });
    if (!modsRef.current.shift) setAnchorId?.(p.id); 
    modsRef.current = { shift: false, ctrl: false };
  };

  const onRowClick = (e) => {
    const ctrl = e.metaKey || e.ctrlKey;

    if (e.shiftKey) {
      onToggleSelect?.(p.id, { range: true, ctrl });
      return; 
    }

    if (ctrl) {
      onToggleSelect?.(p.id, { range: false, ctrl: true });
      setAnchorId?.(p.id);
      return;
    }

    setAnchorId?.(p.id);
    select(p.id);
  };

  return (
    <div
      style={{ ...style, gridTemplateColumns: template }}
      className={`grid items-center px-3 border-b border-eco-border cursor-pointer
        ${isSelected ? "bg-eco-blue/15" : "hover:bg-eco-blue/10"} ${rowClass}`}
      onClick={onRowClick}
      onDoubleClick={() => onPreview?.(p.id)}
      role="row"
      aria-selected={isSelected}
    >
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={isSelected}
          onPointerDown={onCbPointerDown}
          onClick={(e) => e.stopPropagation()}
          onChange={onCbChange}
          aria-label={`Выбрать ${p.fio}`}
        />
      </div>

      {cols.map((c) => {
        switch (c.key) {
          case "id":
            return (
              <div key={c.key} className="text-eco-mute">
                {p.id}
              </div>
            );

          case "fio":
            return (
              <div key={c.key} className="font-medium truncate" title={p.fio}>
                {p.fio}
              </div>
            );

          case "birth":
            return (
              <div key={c.key}>
                {p.birth ? new Date(p.birth).toLocaleDateString("ru-RU") : ""}
              </div>
            );

          case "gender":
            return (
              <div key={c.key} className="text-eco-mute">
                {p.gender}
              </div>
            );

          case "city":
            return (
              <div key={c.key} className="text-eco-mute truncate" title={p.city}>
                {p.city}
              </div>
            );

          case "email":
            return (
              <div key={c.key} className="text-eco-mute truncate" title={p.email}>
                {p.email}
              </div>
            );

          case "status":
            return (
              <div key={c.key}>
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
            );

          default:
            return <div key={c.key} />;
        }
      })}
    </div>
  );
}
