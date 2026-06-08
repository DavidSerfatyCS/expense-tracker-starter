import InsightsPanel from './InsightsPanel';
import FixedItemsPanel from './FixedItemsPanel';

function Sidebar({ transactions, fixedItems, onAddFixed, onDeleteFixed, period, periodType, periodOffset }) {
  return (
    <div className="sidebar">
      <InsightsPanel
        transactions={transactions}
        fixedItems={fixedItems}
        period={period}
        periodType={periodType}
        periodOffset={periodOffset}
      />
      <FixedItemsPanel fixedItems={fixedItems} onAdd={onAddFixed} onDelete={onDeleteFixed} />
    </div>
  );
}

export default Sidebar;
