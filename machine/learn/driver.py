from io_utils import Experiment, parse_args
from skl_utils import generate_results

def main(args):
    exp = Experiment(args)
    input_data, data_info = exp.get_input()
    model, method_type, encoding_strategy = exp.get_model()
    return_val = generate_results(model=model,
                    input_data=input_data,
                    tmpdir=exp.tmpdir,
                    target_name=data_info['target_name'],
                    _id=args['_id'],
                    mode=method_type,
                    filename=data_info['filename'],
                    categories=data_info['categories'],
                    ordinals=data_info['ordinals'],
                    encoding_strategy=encoding_strategy
                    )
    if return_val == "Timeout":
        raise RuntimeError("Experiment failed due to time out!")


if __name__ == "__main__":
    args = parse_args()
    main(args)
