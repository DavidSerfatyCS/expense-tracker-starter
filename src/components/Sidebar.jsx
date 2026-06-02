import InsightsPanel from './InsightsPanel';
import FixedItemsPanel from './FixedItemsPanel';

function Sidebar({ transactions, fixedItems, onAddFixed, onDeleteFixed }) {
  return (
    <div className="sidebar">
      <InsightsPanel transactions={transactions} fixedItems={fixedItems} />
      <FixedItemsPanel fixedItems={fixedItems} onAdd={onAddFixed} onDelete={onDeleteFixed} />
    </div>
  );
}

export default Sidebar;
