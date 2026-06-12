import { getPeriodBounds } from '../utils/dateUtils';

function PeriodSelector({ periodType, periodOffset, onTypeChange, onOffsetChange }) {
  const { label } = getPeriodBounds(periodType, periodOffset);

  const handleTypeChange = (type) => {
    onTypeChange(type);
    onOffsetChange(0);
  };

  return (
    <div className="period-selector">
      <div className="period-nav">
        <button onClick={() => onOffsetChange(periodOffset - 1)}>←</button>
        <span className="period-label">{label}</span>
        <button
          onClick={() => onOffsetChange(periodOffset + 1)}
          disabled={periodOffset >= 0}
        >→</button>
      </div>
      <div className="seg-control">
        <button
          className={periodType === 'week' ? 'active' : ''}
          onClick={() => handleTypeChange('week')}
        >Week</button>
        <button
          className={periodType === 'month' ? 'active' : ''}
          onClick={() => handleTypeChange('month')}
        >Month</button>
      </div>
    </div>
  );
}

export default PeriodSelector;
