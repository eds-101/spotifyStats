type DateHeaderProps = {
    date: string;
};

export const DateHeader = ({ date }: DateHeaderProps) => {
    return (
        <div className="date-header">{date}</div>
    );
};