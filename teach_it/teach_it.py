import warnings

import redis
import pymongo

from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_together.embeddings import TogetherEmbeddings
from langchain_community.vectorstores import MongoDBAtlasVectorSearch

# from teach_it.utils import load_config
from utils import load_config

class Document:
    def __init__(self, config,user_id):
        self.config = config
        self.user_id = user_id
        self.connect_mongodb()
        self.vector_search = None

    def connect_mongodb(self):
        try:
            self.mongo_db = pymongo.MongoClient(
                self.config['db']["MONGO_URI"],
            ) 
        except Exception as e:
            raise Exception(f"Error connecting to MongoDB: {e}")
        else:
            print("Successfully connected to MongoDB")

    def create_vector_base(self,pdf_url):
        try:
            loader = PyPDFLoader(pdf_url)
            data = loader.load()

            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000,chunk_overlap=150)
            docs = text_splitter.split_documents(data)

            collection = self.mongo_db[self.config['db']["MONGO_DB"]][self.config['db']["MONGO_COLLECTION"]]

            self.vector_search = MongoDBAtlasVectorSearch.from_documents(
                docs,embedding=TogetherEmbeddings(together_api_key=self.config['llm']['TOGETHER_API_KEY'],model=self.config['llm']['EMBEDDING_MODEL']),
                collection=collection,
                index_name="vector_search")

            # self.vector_search = MongoDBAtlasVectorSearch.from_documents(
            #     docs,embedding=OpenAIEmbeddings(openai_api_key=self.config['llm']['OPENAI_API_KEY']),
            #     collection=collection,
            #     index_name="default")
            
            print(self.vector_search.similarity_search(query="ABC")[0].page_content)

        except Exception as e:
            print(e)
            raise Exception(f"Error initializing vector search: {e}")
        else:
            print("Successfully initialized vector search")
        
    def create_vector_search(self):
        self.vector_search = MongoDBAtlasVectorSearch.from_connection_string(
        self.config['db']["MONGO_URI"],
        f"{self.config['db']['MONGO_DB']}.{self.config['db']['MONGO_COLLECTION']}",
        TogetherEmbeddings(together_api_key=self.config['llm']['TOGETHER_API_KEY'],model=self.config['llm']['EMBEDDING_MODEL']),
        index_name="vector_index"
    )

    def perform_search(self,query,top_k=5):
        try:
            results = self.vector_search.similarity_search(query=query)
            print(results)
            return results
        except Exception as e:
            raise Exception(f"Error performing search: {e}")
            return []
            

    def clear_documents(self):
        try:
            self.mongo_db[self.config['db']["MONGO_DB"]][self.user_id].drop()
        except Exception as e:
            warnings.warn(f"Error clearing documents: {e}")
            return {"status": False}
        else:
            return {"status": True}

class User:
    def __init__(self, user_id,config):
        self.config = config
        self.user_id = user_id

        # Connect to Redis
        self.connect_redis()

    def generate_ppt(self, file_path):        
        self.user_data = self.redis.hgetall(self.user_id)

    def connect_redis(self):
        try:
            self.redis = redis.Redis(
                host=self.config['db']["REDIS_HOST"],
                port=self.config['db']["REDIS_PORT"],
                db=self.config['db']["REDIS_DB"],
                password=self.config['db']["REDIS_PASSWORD"]
            )
        except Exception as e:
            raise Exception(f"Error connecting to redis: {e}")
        else:
            print("Successully connected to redis")

# Test -> Preprocess Class
# import os
# os.environ["config_toml"] = "../config.toml"

# pdf_url = "https://query.prod.cms.rt.microsoft.com/cms/api/am/binary/RE4HkJP"
# user_id = "123"
# query="negation"

# config = load_config()

# pre = Document(config,user_id)
# #pre.create_vector_base(pdf_url)
# pre.create_vector_search()
# results = pre.perform_search(query)
# for result in results:
#     print(result)

