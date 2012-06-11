# Copyright (c) 2006 The Pragmatic Programmers, LLC.
# Reproduced from the book "Agile Web Development with Rails, 2nd Ed.",
# published by The Pragmatic Bookshelf.
# Available from www.pragmaticprogrammer.com/titles/rails2
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this source code (the "Software"), to deal in the Software without
# restriction, including without limitation the rights to use, copy, modify,
# merge, publish, distribute, sublicense, and/or sell copies of the Software,
# and to permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
# 
# 1) This Software cannot be used in any training course or seminar, whether
# presented live, via video, audio, screencast, or any other media, without
# explicit prior permission from the publisher.
# 
# 2) The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE. 

#START:original
require File.dirname(__FILE__) + '/../test_helper'

class ProductTest < Test::Unit::TestCase
  
  #START:fixtures
  fixtures :products
  #END:fixtures
  
  # Replace this with your real tests.
  def test_truth
    assert true
  end
#END:original

  #START:test_empty_attributes
  def test_invalid_with_empty_attributes
    product = Product.new
    assert !product.valid?
    assert product.errors.invalid?(:title)
    assert product.errors.invalid?(:description)
    assert product.errors.invalid?(:price)
    assert product.errors.invalid?(:image_url)
  end
  #END:test_empty_attributes

  #START:test_positive_price
  def test_positive_price
    product = Product.new(:title       => "My Book Title",
                          :description => "yyy",
                          :image_url   => "zzz.jpg")

    product.price = -1
    assert !product.valid?
    assert_equal "should be at least 0.01", product.errors.on(:price)

    product.price = 0
    assert !product.valid?
    assert_equal "should be at least 0.01", product.errors.on(:price)

    product.price = 1
    assert product.valid?
  end
  #END:test_positive_price

  #START:test_image_url
  def test_image_url
    ok = %w{ fred.gif fred.jpg fred.png FRED.JPG FRED.Jpg
             http://a.b.c/x/y/z/fred.gif }
    bad = %w{ fred.doc fred.gif/more fred.gif.more }
    
    ok.each do |name|
      product = Product.new(:title       => "My Book Title",
                            :description => "yyy",
                            :price       => 1,
                            :image_url   => name)
      assert product.valid?, product.errors.full_messages
    end

    bad.each do |name|
      product = Product.new(:title => "My Book Title", :description => "yyy", :price => 1,
                            :image_url => name)
      assert !product.valid?, "saving #{name}"
    end
  end
  #END:test_image_url

  #START:test_unique_title
  def test_unique_title
    product = Product.new(:title       => products(:ruby_book).title,
                          :description => "yyy", 
                          :price       => 1, 
                          :image_url   => "fred.gif")

    assert !product.save
    assert_equal "has already been taken", product.errors.on(:title)
  end
  #END:test_unique_title

  #START:test_unique_title1
  def test_unique_title1
    product = Product.new(:title       => products(:ruby_book).title,
                          :description => "yyy", 
                          :price       => 1, 
                          :image_url   => "fred.gif")

    assert !product.save
    assert_equal ActiveRecord::Errors.default_error_messages[:taken],
                 product.errors.on(:title)
  end
  #END:test_unique_title1
  
#START:original
end
#END:original
