interface IfProps {
  condition: boolean;
  children: React.ReactNode;
}
export const If = ({ condition, children }: IfProps) => {
  if (condition) {
    return <>{children}</>;
  }
  return null;
};
