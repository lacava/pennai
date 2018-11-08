

import ai.results_utils as results_utils
import unittest
from unittest import skip
from unittest.mock import Mock, patch
from nose.tools import nottest, raises, assert_equals
from parameterized import parameterized
import pandas as pd


@nottest
def load_test_data():
    return [
        ("benchmark5", 
        	"ai/metalearning/sklearn-benchmark5-data-short.tsv.gz", 
        	"machine/datasets/byuser_full/testuser",
        	pd.DataFrame(data={'col1': [1, 2], 'col2': [3, 4]}),
        	{'apple':[1,2,3]},
#        ("badPath", 
#        	"ai/metalearning/sklearn-benchmarkfoo-data-short.tsv.gz", 
#        	"machine/datasets/byuser_full/testuser/foooo",
#        	pd.DataFrame(data={'col1': [1, 2], 'col2': [3, 4]}),
#        	{'apple':[a,b,c]}
		)
    ]

class TestResultUtils(unittest.TestCase):
	@parameterized.expand(load_test_data)
	def test_load_results_from_file(self, name, testResultFile, testResultsDataDirectory, expectedResultsData, expectedMetafeaturesData):
		data = results_utils._load_results_from_file(testResultFile)
		assert isinstance(data, pd.DataFrame)

		self.assertGreater(len(data), 1)
		#assert expectedResultsData.equals(data)

	@parameterized.expand(load_test_data)
	def test_generate_metadata_from_directory(self, name, testResultFile, testResultsDataDirectory, expectedResultsData, expectedMetafeaturesData):
		data = results_utils._generate_metadata_from_directory(testResultsDataDirectory)
		assert isinstance(data, dict)

		self.assertGreater(len(data.keys()), 1)
		#assert expectedMetafeaturesData.equals(data)

	@parameterized.expand(load_test_data)
	def test_load_knowledgebase(self, name, testResultFile, testResultsDataDirectory, expectedResultsData, expectedMetafeaturesData):
		result = results_utils.load_knowledgebase(testResultFile, testResultsDataDirectory)
		assert 'resultsData' in result
		assert 'metafeaturesData' in result

		assert isinstance(result['resultsData'], pd.DataFrame)
		assert isinstance(result['metafeaturesData'], dict)

		self.assertGreater(len(result['resultsData']), 1)
		self.assertGreater(len(result['metafeaturesData'].keys()), 1)

		#assert expectedResultsData.equals(result['resultsData']) 
		#assert expectedMetafeaturesData.equals(result['metafeaturesData'])