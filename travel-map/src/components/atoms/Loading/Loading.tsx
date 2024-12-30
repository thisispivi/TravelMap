import "./Loading.scss";

interface LoadingProps {
  className?: string;
}

/**
 * Loading component
 *
 * The Loading component is an atom that displays a spinner while the content is loading.
 * @component
 * @param {LoadingProps} props - The props of the component
 * @param {string} props.className - The class name of the component
 * @returns {JSX.Element} The Loading component
 */
export default function Loading({ className = "" }: LoadingProps): JSX.Element {
  return <div className={`loader ${className}`} />;
}
