interface Props {
  className?: string;
}

export const BPCitationFooter = ({ className = "" }: Props) => (
  <p className={`text-xs text-gray-400 mt-2 ${className}`}>
    * Whelton PK, et al. 2017 ACC/AHA Guideline for the Prevention, Detection,
    Evaluation, and Management of High Blood Pressure in Adults.{" "}
    <em>J Am Coll Cardiol.</em> 2018;71(19):e127–e248.{" "}
    <a
      href="https://doi.org/10.1016/j.jacc.2017.11.006"
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-gray-600"
    >
      doi:10.1016/j.jacc.2017.11.006
    </a>
  </p>
);
