interface Props {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, sub, action }: Props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
      <div>
        <h1 style={{ margin: 0 }}>{title}</h1>
        {sub && <p className="sub" style={{ margin: '.375rem 0 0' }}>{sub}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
